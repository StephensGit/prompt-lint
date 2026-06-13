import { afterEach, describe, expect, mock, test } from 'bun:test';
import { RefineError, streamRefine } from './refine';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** A `text/plain` streaming Response that emits `chunks` one at a time. */
function streamingResponse(chunks: string[], init?: ResponseInit): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    ...init,
  });
}

describe('streamRefine', () => {
  test('decodes the refinedPrompt progressively and resolves with the final text', async () => {
    // The model returns a single JSON object; the route streams its raw deltas.
    const chunks = [
      '{"refinedPrompt": "## Goal',
      '\\nReset the dropdown.',
      '\\n\\n## Scope\\nfeatures/results/",',
      ' "changes": []}',
    ];
    globalThis.fetch = mock(async () =>
      streamingResponse(chunks),
    ) as unknown as typeof fetch;

    const snapshots: string[] = [];
    const final = await streamRefine({
      prompt: 'fix the dropdown',
      onText: (text) => snapshots.push(text),
    });

    expect(final).toBe(
      '## Goal\nReset the dropdown.\n\n## Scope\nfeatures/results/',
    );
    // The first snapshot never contains the JSON wrapper.
    expect(snapshots[0]).toBe('## Goal');
    expect(snapshots.at(-1)).toBe(final);
  });

  test('sends the prompt as { prompt } JSON to /api/refine', async () => {
    const fetchMock = mock(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        streamingResponse(['{"refinedPrompt":"x"}']),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await streamRefine({ prompt: 'hello', onText: () => {} });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/refine');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({ prompt: 'hello' });
  });

  test('maps the route JSON error body to a RefineError', async () => {
    globalThis.fetch = mock(async () =>
      Response.json(
        { error: 'The refining service returned an error.' },
        { status: 502 },
      ),
    ) as unknown as typeof fetch;

    const promise = streamRefine({ prompt: 'hello', onText: () => {} });
    await expect(promise).rejects.toBeInstanceOf(RefineError);
    await expect(promise).rejects.toThrow('refining service returned an error');
  });
});
