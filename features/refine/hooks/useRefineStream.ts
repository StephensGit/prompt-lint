'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RefineError, streamRefine } from '@/features/refine/api/refine';
import type { RefineChange, RefineRequest } from '@/features/refine/schema';
import { EXAMPLES } from '@/lib/examples';

export type RefineStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

export interface UseRefineStream {
  /** The refined prompt decoded so far (grows while streaming). */
  text: string;
  /** The "what changed" entries — populated on stream end (empty until then). */
  changes: RefineChange[];
  status: RefineStatus;
  /** True while a request is in flight (loading or streaming). */
  isStreaming: boolean;
  /** A user-facing message when the last request failed, else null. */
  error: string | null;
  /** True when the current result came from the static demo data (not a live API call). */
  isDemoResult: boolean;
  /** Start refining a validated prompt via the live API. Cancels any in-flight request. */
  refine: (data: RefineRequest, apiKey: string) => void;
  /** Instantly render the static output for an example chip (no API call). */
  refineDemo: (exampleId: string) => void;
  /** Reset all result state back to idle. */
  reset: () => void;
  /** Re-run the most recent live prompt (used by the error state's retry). */
  retry: () => void;
}

export function useRefineStream(): UseRefineStream {
  const [text, setText] = useState('');
  const [changes, setChanges] = useState<RefineChange[]>([]);
  const [status, setStatus] = useState<RefineStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isDemoResult, setIsDemoResult] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);
  const lastPromptRef = useRef<string | null>(null);
  const lastApiKeyRef = useRef<string>('');

  const run = useCallback((prompt: string, apiKey: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    lastPromptRef.current = prompt;
    lastApiKeyRef.current = apiKey;

    setText('');
    setChanges([]);
    setError(null);
    setIsDemoResult(false);
    setStatus('loading');

    streamRefine({
      prompt,
      apiKey,
      signal: controller.signal,
      onText: (next) => {
        if (controller.signal.aborted) {
          return;
        }
        setText(next);
        if (next.length > 0) {
          setStatus('streaming');
        }
      },
    })
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        if (result.refinedPrompt.trim().length === 0) {
          setError('The refining service returned an empty result. Try again.');
          setStatus('error');
          return;
        }
        setText(result.refinedPrompt);
        setChanges(result.changes);
        setStatus('done');
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          err instanceof RefineError
            ? err.message
            : 'Something went wrong while refining.';
        setError(message);
        setStatus('error');
      });
  }, []);

  const refine = useCallback(
    (data: RefineRequest, apiKey: string) => {
      run(data.prompt, apiKey);
    },
    [run],
  );

  const refineDemo = useCallback((exampleId: string) => {
    controllerRef.current?.abort();
    const example = EXAMPLES.find((e) => e.id === exampleId);
    if (!example) {
      return;
    }
    setText(example.output.refinedPrompt);
    setChanges(example.output.changes);
    setError(null);
    setIsDemoResult(true);
    setStatus('done');
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setText('');
    setChanges([]);
    setError(null);
    setIsDemoResult(false);
    setStatus('idle');
  }, []);

  const retry = useCallback(() => {
    if (lastPromptRef.current !== null) {
      run(lastPromptRef.current, lastApiKeyRef.current);
    }
  }, [run]);

  // Cancel an in-flight request if the component unmounts.
  useEffect(() => () => controllerRef.current?.abort(), []);

  return {
    text,
    changes,
    status,
    isStreaming: status === 'loading' || status === 'streaming',
    error,
    isDemoResult,
    refine,
    refineDemo,
    reset,
    retry,
  };
}
