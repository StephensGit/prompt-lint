'use client';

import { ArrowDown } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  PromptInput,
  ResultView,
  useRefineStream,
  WhatChanged,
} from '@/features/refine';

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
      {children}
    </p>
  );
}

export default function Home() {
  const { text, changes, status, error, refine, retry } = useRefineStream();

  // Per design: "What changed" is not rendered until result.
  const showChanges = status === 'done';

  return (
    <main className="flex-1 px-[clamp(16px,4vw,32px)] py-[clamp(16px,3.4vw,30px)] pb-14">
      {/*
       * Mobile:  stacked column, max-w 720px, with a flow connector between panes.
       * Desktop: Focus layout — input spans full width (row 1); result in wide left
       *          column (row 2); "What changed" in sticky 312px right rail (row 2).
       *          Kicks in at 720px per the design handoff.
       */}
      <div
        className={[
          'mx-auto flex flex-col gap-5 max-w-[720px]',
          'min-[720px]:grid min-[720px]:grid-cols-[minmax(0,1fr)_312px] min-[720px]:auto-rows-min',
          'min-[720px]:items-start min-[720px]:gap-x-6 min-[720px]:gap-y-[22px]',
          'min-[720px]:max-w-[1180px]',
        ].join(' ')}
      >
        {/* Input pane — spans both columns, row 1 on desktop */}
        <div className="min-[720px]:col-span-2 min-[720px]:row-start-1">
          <Eyebrow>Rough prompt</Eyebrow>
          <PromptInput onRefine={refine} status={status} />
        </div>

        {/* Mobile-only flow connector */}
        <div
          className="flex flex-col items-center -my-1 text-muted-foreground min-[720px]:hidden"
          aria-hidden="true"
        >
          <span className="h-[18px] w-px bg-[hsl(var(--border-strong))]" />
          <ArrowDown className="h-4 w-4" />
          <span className="h-[18px] w-px bg-[hsl(var(--border-strong))]" />
        </div>

        {/* Result pane — col 1 (wide), row 2 on desktop */}
        <div className="min-[720px]:col-start-1 min-[720px]:row-start-2">
          <Eyebrow>Result</Eyebrow>
          <ResultView
            status={status}
            text={text}
            error={error}
            onRetry={retry}
          />
        </div>

        {/* Changes pane — col 2 (312px rail), row 2, sticky on desktop */}
        <div className="min-[720px]:col-start-2 min-[720px]:row-start-2 min-[720px]:sticky min-[720px]:top-20">
          {showChanges && (
            <div className="animate-enter">
              <Eyebrow>What changed</Eyebrow>
              <WhatChanged changes={changes} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
