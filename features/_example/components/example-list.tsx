'use client';

import { cn } from '@/lib/utils';
import { useExamples } from '../api/examples';

export function ExampleList({ className }: { className?: string }) {
  const { data, isPending, isError } = useExamples();

  if (isPending) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  if (isError) {
    return <p className="text-destructive">Could not load examples.</p>;
  }

  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {data.map((example) => (
        <li key={example.id} className="rounded-md border p-2">
          {example.name}
        </li>
      ))}
    </ul>
  );
}
