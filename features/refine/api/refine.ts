import {
  type RefineResponse,
  RefineResponseSchema,
} from '@/features/refine/schema';
import { extractRefinedPrompt } from '@/features/refine/utils/refined-prompt';

// No client-side timeout by design: the stream ends when the server closes it, and a
// fixed cap risks cutting off a legitimately slow refine. [TODO: confirm whether a
// client timeout is needed, and what duration, if a stuck stream shows up in testing.]

export interface StreamRefineOptions {
  /** The validated rough prompt to refine. */
  prompt: string;
  /** The user's Anthropic API key, sent as X-Anthropic-Key (BYOK). */
  apiKey: string;
  /** Called with the decoded refined-prompt text on every chunk (cumulative). */
  onText: (text: string) => void;
  /** Optional caller signal for cancellation (e.g. a superseding submit / unmount). */
  signal?: AbortSignal;
}

/** A refine request failed in a way worth showing the user a friendly message for. */
export class RefineError extends Error {
  readonly kind: 'model' | 'network';
  constructor(kind: RefineError['kind'], message: string) {
    super(message);
    this.name = 'RefineError';
    this.kind = kind;
  }
}

/**
 * POST the prompt to `/api/refine` and stream the refined prompt back.
 *
 * The route streams the model's raw JSON output as `text/plain`; we decode the
 * `refinedPrompt` value out of that partial JSON as it arrives (see
 * `extractRefinedPrompt`) and hand each cumulative snapshot to `onText`. Resolves
 * with the final, fully-validated `RefineResponse` (refined prompt + changes);
 * rejects with a `RefineError`.
 */
export async function streamRefine({
  prompt,
  apiKey,
  onText,
  signal,
}: StreamRefineOptions): Promise<RefineResponse> {
  let response: Response;
  try {
    response = await fetch('/api/refine', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Anthropic-Key': apiKey,
      },
      body: JSON.stringify({ prompt }),
      signal,
    });
  } catch (error) {
    throw toRefineError(error);
  }

  if (!response.ok || !response.body) {
    throw new RefineError('model', await readErrorMessage(response));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let raw = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      raw += decoder.decode(value, { stream: true });
      onText(extractRefinedPrompt(raw));
    }
  } catch (error) {
    throw toRefineError(error);
  }

  return finalResult(raw);
}

/**
 * Authoritative parse of the complete stream — the single place changes are read.
 * Falls back to the incremental prose decode (and no changes) if the JSON is
 * truncated or invalid, so a malformed tail degrades to "result, no changes".
 */
function finalResult(raw: string): RefineResponse {
  try {
    const parsed = RefineResponseSchema.safeParse(JSON.parse(raw));
    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // Not valid JSON (e.g. truncated) — fall through to the incremental decode.
  }
  return { refinedPrompt: extractRefinedPrompt(raw), changes: [] };
}

/** The route returns clean JSON errors (`{ error }`) on 400/500/502. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === 'string' && body.error.length > 0) {
      return body.error;
    }
  } catch {
    // Non-JSON error body — fall through to the generic message.
  }
  return 'The refining service returned an error.';
}

function toRefineError(error: unknown): RefineError {
  if (error instanceof DOMException && error.name === 'AbortError') {
    // Caller-initiated cancel (e.g. a new submit / unmount) — not user-facing; the
    // hook swallows it via the aborted-signal guard.
    return new RefineError('network', 'Request cancelled.');
  }
  return new RefineError(
    'network',
    'Could not reach the refining service. Check your connection and try again.',
  );
}
