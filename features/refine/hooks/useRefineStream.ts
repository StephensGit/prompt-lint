'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RefineError, streamRefine } from '@/features/refine/api/refine';
import type { RefineChange, RefineRequest } from '@/features/refine/schema';

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
  /** Start refining a validated prompt. Cancels any in-flight request. */
  refine: (data: RefineRequest) => void;
  /** Re-run the most recent prompt (used by the error state's retry). */
  retry: () => void;
}

export function useRefineStream(): UseRefineStream {
  const [text, setText] = useState('');
  const [changes, setChanges] = useState<RefineChange[]>([]);
  const [status, setStatus] = useState<RefineStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const lastPromptRef = useRef<string | null>(null);

  const run = useCallback((prompt: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    lastPromptRef.current = prompt;

    setText('');
    setChanges([]);
    setError(null);
    setStatus('loading');

    streamRefine({
      prompt,
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
        // Fail-soft on a missing-changes tail is fine (empty list), but if even the
        // prose is unusable there is nothing to show — treat it as a model error
        // rather than render an empty result panel.
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
        // A cancel from a superseding request isn't user-facing.
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
    (data: RefineRequest) => {
      run(data.prompt);
    },
    [run],
  );

  const retry = useCallback(() => {
    if (lastPromptRef.current !== null) {
      run(lastPromptRef.current);
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
    refine,
    retry,
  };
}
