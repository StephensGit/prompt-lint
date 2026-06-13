import { Wand2 } from 'lucide-react';
import type { RefineStatus } from '@/features/refine/hooks/useRefineStream';
import type { RefineChange } from '@/features/refine/schema';

interface WhatChangedProps {
  status: RefineStatus;
  /** Populated on stream end; empty while the result is still streaming. */
  changes: RefineChange[];
}

/**
 * The "what changed and why" panel shown beside the refined result. Changes land
 * on stream end, so this shows a subtle skeleton while streaming and fails soft to
 * a quiet "no changes" state when the model returned none (or the tail was
 * unparseable — `streamRefine` degrades that to an empty list).
 */
export function WhatChanged({ status, changes }: WhatChangedProps) {
  const isPending = status === 'loading' || status === 'streaming';

  return (
    <aside className="flex h-fit flex-col overflow-hidden rounded-lg border border-(--border-strong) bg-card">
      <div className="flex items-center gap-2 border-b border-(--border-strong) px-5 py-3">
        <Wand2 className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">What changed</h2>
        {status === 'done' && changes.length > 0 && (
          <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {changes.length}
          </span>
        )}
      </div>

      <div className="p-5">
        {isPending ? (
          <ChangesSkeleton />
        ) : changes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No changes were needed.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {changes.map((change, index) => (
              <li
                // Summaries can repeat; index is stable for this static list.
                // biome-ignore lint/suspicious/noArrayIndexKey: order-stable change list
                key={index}
                className="flex flex-col gap-1"
              >
                <p className="text-[13.5px] font-semibold text-foreground">
                  {change.summary}
                </p>
                <p className="text-[12.5px] leading-[1.6] text-muted-foreground">
                  {change.reason}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function ChangesSkeleton() {
  return (
    <output className="flex flex-col gap-4" aria-label="Loading changes…">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex flex-col gap-1.5">
          <div className="h-3.5 w-2/5 rounded bg-muted motion-safe:animate-pulse" />
          <div className="h-3 w-full rounded bg-muted motion-safe:animate-pulse" />
        </div>
      ))}
    </output>
  );
}
