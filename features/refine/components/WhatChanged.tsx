import { Check, Wand2 } from 'lucide-react';
import type { RefineChange } from '@/features/refine/schema';

interface WhatChangedProps {
  /** Populated change list — only rendered when the stream is done. */
  changes: RefineChange[];
}

// Positional hue assignment: cycles blue → violet → amber.
// The .change-item hover styles in globals.css key off --huec (set inline per card).
const HUE_VARS = ['--hue1', '--hue2', '--hue3'] as const;

/**
 * "What changed & why" panel — card-per-change with a coloured check marker,
 * cross-keyed to the matching hue-tinted prompt block. Rendered only on done.
 */
export function WhatChanged({ changes }: WhatChangedProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-[22px] py-3">
        <Wand2 className="h-[15px] w-[15px] text-muted-foreground" />
        <h2 className="text-[13px] font-semibold text-foreground">
          What changed &amp; why
        </h2>
        {changes.length > 0 && (
          <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
            {changes.length}
          </span>
        )}
      </div>

      {/* Change list */}
      <div className="flex flex-col gap-2.5 p-[22px]">
        {changes.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            No changes were needed.
          </p>
        ) : (
          changes.map((change, index) => {
            const hueVar = HUE_VARS[index % HUE_VARS.length];
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: order-stable change list
                key={index}
                className="change-item grid grid-cols-[auto_1fr] gap-3 rounded-[10px] border border-border bg-card p-[13px_14px]"
                style={{ '--huec': `var(${hueVar})` } as React.CSSProperties}
              >
                {/* Coloured check marker */}
                <div className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-[hsl(var(--huec)/0.10)] text-[hsl(var(--huec))] dark:bg-[hsl(var(--huec)/0.16)]">
                  <Check className="h-[13px] w-[13px]" strokeWidth={2.6} />
                </div>

                {/* Change content */}
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold tracking-[-0.005em] text-foreground">
                    {change.summary}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-[1.5] text-muted-foreground">
                    {change.reason}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
