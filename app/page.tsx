'use client';

import { PromptInput, ResultView, useRefineStream } from '@/features/refine';

export default function Home() {
  const { text, status, error, refine, retry } = useRefineStream();

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-6 py-8">
      <PromptInput onRefine={refine} />
      <ResultView status={status} text={text} error={error} onRetry={retry} />
    </main>
  );
}
