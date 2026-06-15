import { beforeAll, beforeEach, describe, expect, mock, test } from 'bun:test';
import { MAX_PROMPT_LENGTH } from '@/features/refine';

// --- Mock state, driven per test ---------------------------------------------

class MockAPIError extends Error {
  status?: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** An async-iterable whose first pull rejects — simulates a pre-stream upstream failure. */
function throwingStream(error: unknown) {
  return {
    [Symbol.asyncIterator]() {
      return { next: () => Promise.reject(error) };
    },
  };
}

let constructed = 0;
let streamCalls = 0;
let streamImpl: () => unknown;

class MockAnthropic {
  static APIError = MockAPIError;
  messages = {
    stream: () => {
      streamCalls += 1;
      return streamImpl();
    },
  };
  constructor() {
    constructed += 1;
  }
}

let POST: (request: Request) => Promise<Response>;

beforeAll(async () => {
  mock.module('@anthropic-ai/sdk', () => ({ default: MockAnthropic }));
  ({ POST } = await import('./route'));
});

beforeEach(() => {
  constructed = 0;
  streamCalls = 0;
  streamImpl = () => {
    throw new Error('stream should not have been called');
  };
});

/** Posts to the route with a valid X-Anthropic-Key header by default. */
function post(body: string, apiKey: string | null = 'sk-ant-test') {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (apiKey !== null) {
    headers['X-Anthropic-Key'] = apiKey;
  }
  return POST(
    new Request('http://localhost/api/refine', {
      method: 'POST',
      headers,
      body,
    }),
  );
}

// --- Tests --------------------------------------------------------------------

describe('POST /api/refine — invalid input', () => {
  test('rejects malformed JSON with 400 and never calls Anthropic', async () => {
    const res = await post('{not json');
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeTruthy();
    expect(constructed).toBe(0);
    expect(streamCalls).toBe(0);
  });

  test('rejects an empty prompt with 400', async () => {
    const res = await post(JSON.stringify({ prompt: '' }));
    expect(res.status).toBe(400);
    expect(constructed).toBe(0);
  });

  test('rejects an over-length prompt with 400', async () => {
    const res = await post(
      JSON.stringify({ prompt: 'a'.repeat(MAX_PROMPT_LENGTH + 1) }),
    );
    expect(res.status).toBe(400);
    expect(constructed).toBe(0);
  });
});

describe('POST /api/refine — missing API key', () => {
  test('returns 400 with missing-key error and never calls Anthropic', async () => {
    const res = await post(
      JSON.stringify({ prompt: 'add a dark mode toggle' }),
      null, // omit X-Anthropic-Key header
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(
      'API key required — add yours in Settings.',
    );
    expect(constructed).toBe(0);
    expect(streamCalls).toBe(0);
  });
});

describe('POST /api/refine — upstream error', () => {
  test('maps an Anthropic.APIError status to a clean JSON error with no stack trace', async () => {
    streamImpl = () =>
      throwingStream(
        new MockAPIError(529, 'overloaded_error: stack details here'),
      );
    const res = await post(
      JSON.stringify({ prompt: 'add a dark mode toggle' }),
    );
    expect(res.status).toBe(529);
    const body = await res.json();
    expect(body.error).toBeTruthy();
    // The upstream message/stack must not leak into the response.
    expect(JSON.stringify(body)).not.toContain('overloaded_error');
    expect(JSON.stringify(body)).not.toContain('stack');
    expect(constructed).toBe(1);
    expect(streamCalls).toBe(1);
  });

  test('returns 401 with a friendly message and no upstream detail for an invalid key', async () => {
    streamImpl = () =>
      throwingStream(new MockAPIError(401, 'auth_error: secret'));
    const res = await post(
      JSON.stringify({ prompt: 'add a dark mode toggle' }),
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
    expect(JSON.stringify(body)).not.toContain('auth_error');
    expect(JSON.stringify(body)).not.toContain('secret');
  });

  test('returns 429 with a friendly message and no upstream detail on rate limit', async () => {
    streamImpl = () =>
      throwingStream(new MockAPIError(429, 'rate_limit_error: quota'));
    const res = await post(
      JSON.stringify({ prompt: 'add a dark mode toggle' }),
    );
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBeTruthy();
    expect(JSON.stringify(body)).not.toContain('rate_limit_error');
    expect(JSON.stringify(body)).not.toContain('quota');
  });

  test('falls back to 502 for a non-APIError upstream failure', async () => {
    streamImpl = () => throwingStream(new Error('socket hang up'));
    const res = await post(
      JSON.stringify({ prompt: 'add a dark mode toggle' }),
    );
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain('socket hang up');
  });
});
