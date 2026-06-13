'use client';

import type { RefineRequest } from '@/features/refine';
import { PromptInput, ResultView } from '@/features/refine';

function handleRefine(data: RefineRequest) {
  console.log(data);
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-6 py-8">
      <PromptInput onRefine={handleRefine} />
      <ResultView />
    </main>
  );
}
