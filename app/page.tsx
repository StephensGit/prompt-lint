'use client';

import {
  PromptInput,
  ResultView,
  useRefineStream,
  WhatChanged,
} from '@/features/refine';

export default function Home() {
  const { text, changes, status, error, refine, retry } = useRefineStream();

  // The what-changed panel only makes sense alongside a (streaming or finished)
  // result — the idle empty-state and the error state span the full width.
  const showChanges =
    status === 'loading' || status === 'streaming' || status === 'done';

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-6 py-8">
      <PromptInput onRefine={refine} />
      {showChanges ? (
        <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
          <ResultView
            status={status}
            text={text}
            error={error}
            onRetry={retry}
          />
          <WhatChanged status={status} changes={changes} />
        </div>
      ) : (
        <ResultView status={status} text={text} error={error} onRetry={retry} />
      )}
    </main>
  );
}
