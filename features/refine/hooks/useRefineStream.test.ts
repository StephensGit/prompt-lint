import { afterEach, describe, expect, test } from 'bun:test';
import { renderHook } from '@testing-library/react';
import { EXAMPLES } from '@/lib/examples';
import { act, cleanup } from '@/test-utils/render-with-providers';
import { useRefineStream } from './useRefineStream';

afterEach(cleanup);

describe('useRefineStream — refineDemo', () => {
  test('instantly sets status to done with the example output', async () => {
    const { result } = renderHook(() => useRefineStream());
    const example = EXAMPLES[0];

    await act(async () => {
      result.current.refineDemo(example.id);
    });

    expect(result.current.status).toBe('done');
    expect(result.current.text).toBe(example.output.refinedPrompt);
    expect(result.current.changes).toEqual(example.output.changes);
    expect(result.current.isDemoResult).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isStreaming).toBe(false);
  });

  test('is a no-op for an unknown example id', async () => {
    const { result } = renderHook(() => useRefineStream());

    await act(async () => {
      result.current.refineDemo('does-not-exist');
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.text).toBe('');
  });
});

describe('useRefineStream — reset', () => {
  test('clears all state back to idle after a demo result', async () => {
    const { result } = renderHook(() => useRefineStream());
    const example = EXAMPLES[0];

    await act(async () => {
      result.current.refineDemo(example.id);
    });
    expect(result.current.status).toBe('done');

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.text).toBe('');
    expect(result.current.changes).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isDemoResult).toBe(false);
  });
});
