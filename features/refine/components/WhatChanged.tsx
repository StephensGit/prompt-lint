import { Wand2 } from 'lucide-react';
import type { RefineStatus } from '@/features/refine/hooks/useRefineStream';
import type { RefineChange } from '@/features/refine/schema';
import { cn } from '@/lib/utils';

interface WhatChangedProps {
  status: RefineStatus;
  /** Populated on stream end; empty while the result is still streaming. */
  changes: RefineChange[];
}

// Colour-code each change header by cycling the section hue tokens (blue / violet /
// amber), matching the design. The change data carries no category, so the hue is
// positional; legible in both themes since each hue token has a light + dark value.
const HEADER_HUES = [
  'text-[hsl(var(--hue1))]',
  'text-[hsl(var(--hue2))]',
  'text-[hsl(var(--hue3))]',
];

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
        <h2 className="text-[13px] font-semibold text-foreground">
          What changed
        </h2>
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
                <p
                  className={cn(
                    'text-[13.5px] font-semibold',
                    HEADER_HUES[index % HEADER_HUES.length],
                  )}
                >
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
