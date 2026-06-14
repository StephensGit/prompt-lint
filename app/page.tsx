'use client';

import type { ReactNode } from 'react';
import {
  PromptInput,
  ResultView,
  useRefineStream,
  WhatChanged,
} from '@/features/refine';

/**
 * Section eyebrow above each panel (handoff). Sits outside the cards.
 * TODO: confirm exact eyebrow margin-bottom from the comp — using 8px (mb-2).
 */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
      {children}
    </p>
  );
}

export default function Home() {
  const { text, changes, status, error, refine, retry } = useRefineStream();

  // The what-changed panel only makes sense alongside a (streaming or finished)
  // result — the idle empty-state and the error state span the full width.
  const showChanges =
    status === 'loading' || status === 'streaming' || status === 'done';

  const result = (
    <ResultView status={status} text={text} error={error} onRetry={retry} />
  );

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-6 py-8">
      <section>
        <Eyebrow>Rough prompt</Eyebrow>
        <PromptInput onRefine={refine} />
      </section>

      {showChanges ? (
        <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
          <section>
            <Eyebrow>Result</Eyebrow>
            {result}
          </section>
          <section>
            <Eyebrow>What changed</Eyebrow>
            <WhatChanged status={status} changes={changes} />
          </section>
        </div>
      ) : (
        <section>
          <Eyebrow>Result</Eyebrow>
          {result}
        </section>
      )}
    </main>
  );
}
