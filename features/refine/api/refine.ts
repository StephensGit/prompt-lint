import {
  type RefineResponse,
  RefineResponseSchema,
} from '@/features/refine/schema';
import { extractRefinedPrompt } from '@/features/refine/utils/refined-prompt';

/** Give a slow upstream a generous ceiling, then surface a timeout (design: ~30s). */
const REQUEST_TIMEOUT_MS = 30_000;

export interface StreamRefineOptions {
  /** The validated rough prompt to refine. */
  prompt: string;
  /** Called with the decoded refined-prompt text on every chunk (cumulative). */
  onText: (text: string) => void;
  /** Optional caller signal; combined with the internal timeout. */
  signal?: AbortSignal;
}

/** A refine request failed in a way worth showing the user a friendly message for. */
export class RefineError extends Error {
  readonly kind: 'model' | 'timeout' | 'network';
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
  onText,
  signal,
}: StreamRefineOptions): Promise<RefineResponse> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const composite = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch('/api/refine', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: composite,
    });
  } catch (error) {
    throw toRefineError(error, timeout);
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
    throw toRefineError(error, timeout);
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

function toRefineError(error: unknown, timeout: AbortSignal): RefineError {
  if (timeout.aborted) {
    return new RefineError(
      'timeout',
      'That took longer than 30s and was cancelled. Your input is still here — retry when ready.',
    );
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    // Caller-initiated cancel (e.g. a new submit) — not user-facing.
    return new RefineError('network', 'Request cancelled.');
  }
  return new RefineError(
    'network',
    'Could not reach the refining service. Check your connection and try again.',
  );
}
