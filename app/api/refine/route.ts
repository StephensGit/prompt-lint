import Anthropic from '@anthropic-ai/sdk';
import { META_PROMPT, parseRefineRequest } from '@/features/refine';

/** The model that does the refining. Sent the meta-prompt as its system prompt. */
const MODEL = 'claude-sonnet-4-6';
/** The refined prompt + changes JSON is small; this is ample headroom. */
const MAX_TOKENS = 4096;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/** Map a pre-stream upstream failure to a clean status — never leak a stack trace. */
function upstreamError(error: unknown) {
  if (error instanceof Anthropic.APIError) {
    return jsonError(
      'The refining service returned an error.',
      error.status ?? 502,
    );
  }
  return jsonError('Could not reach the refining service.', 502);
}

/**
 * POST /api/refine — the server-side Anthropic proxy.
 *
 * Holds ANTHROPIC_API_KEY (server-only), sends the rough prompt to the Messages
 * API with META_PROMPT as the system prompt, and streams the model's raw text
 * deltas straight back. A thin pipe: it does not parse or reshape the output.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Request body must be valid JSON.', 400);
  }

  const parsed = parseRefineRequest(body);
  if (!parsed.ok) {
    const [message] = parsed.errors.fieldErrors.prompt ?? [];
    return jsonError(message ?? 'Enter a prompt to refine.', 400);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonError(
      'The server is not configured with an ANTHROPIC_API_KEY.',
      500,
    );
  }

  const anthropic = new Anthropic({ apiKey });
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: META_PROMPT,
    messages: [{ role: 'user', content: parsed.data.prompt }],
  });

  // Pull the first event before committing the response, so pre-stream failures
  // (auth, rate limit, overload) surface as a proper status rather than a 200
  // with a broken body. Once we return below, the status is locked at 200.
  const iterator = stream[Symbol.asyncIterator]();
  let first: IteratorResult<Anthropic.MessageStreamEvent>;
  try {
    first = await iterator.next();
  } catch (error) {
    return upstreamError(error);
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (let result = first; !result.done; result = await iterator.next()) {
          const event = result.value;
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        // The status is already committed to 200; the client sees a truncated body.
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
