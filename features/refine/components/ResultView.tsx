import { AlertTriangle, RotateCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/features/refine/components/CopyButton';
import { RefinedPrompt } from '@/features/refine/components/RefinedPrompt';
import type { RefineStatus } from '@/features/refine/hooks/useRefineStream';

interface ResultViewProps {
  status: RefineStatus;
  /** Refined prompt text decoded so far. */
  text: string;
  /** User-facing error message when `status === 'error'`. */
  error: string | null;
  /** Re-run the last prompt (error retry). */
  onRetry: () => void;
  /** True when the result came from static demo data rather than a live API call. */
  isDemoResult?: boolean;
}

const MODEL_LABEL = 'Refined with Claude Sonnet 4.6';
const DEMO_LABEL = 'Pre-computed example';

// Six shimmer lines of varied widths (matching design handoff). Heights alternate
// between 10px (every 3rd starting at 0) and 12px per the prototype.
const SKELETON_WIDTHS = ['40%', '92%', '78%', '30%', '88%', '64%'];

export function ResultView({
  status,
  text,
  error,
  onRetry,
  isDemoResult = false,
}: ResultViewProps) {
  if (status === 'idle') {
    return <EmptyState />;
  }

  if (status === 'error') {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  const isStreaming = status === 'loading' || status === 'streaming';

  return (
    <div className="animate-enter flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between gap-3 border-b border-border pl-[22px] pr-[14px] py-3">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <Sparkles className="h-[15px] w-[15px] text-muted-foreground" />
          Refined prompt
        </h2>
        {status === 'done' && text.length > 0 && <CopyButton text={text} />}
      </div>

      {/* Body */}
      <div className="px-[22px] py-1.5 pb-[18px]">
        {status === 'loading' ? (
          <Skeleton />
        ) : (
          <RefinedPrompt text={text} isStreaming={isStreaming} />
        )}
      </div>

      {/* Footer — model attribution */}
      {status === 'done' && (
        <div className="flex items-center gap-2 border-t border-border px-[22px] py-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          <span className="text-[12px] text-muted-foreground">
            {isDemoResult ? DEMO_LABEL : MODEL_LABEL}
          </span>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-(--border-strong) bg-(--surface) p-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[14px] font-semibold text-foreground">
            Your refined prompt appears here
          </h2>
          <p className="max-w-[34ch] text-[13px] leading-[1.55] text-muted-foreground">
            Paste a rough instruction above and hit Refine. You&apos;ll get a sharper,
            AI&nbsp;agent-ready prompt plus a short &ldquo;what changed&rdquo;.
          </p>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <output
      className="flex max-w-[70ch] flex-col gap-[11px] py-2"
      aria-label="Refining…"
    >
      {SKELETON_WIDTHS.map((width, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed, static skeleton rows
          key={index}
          className="skeleton-shimmer rounded-[6px]"
          style={{
            width,
            height: index % 3 === 0 ? 10 : 12,
          }}
        />
      ))}
    </output>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex gap-[13px] rounded-lg border border-red-500/40 bg-red-500/[0.07] p-[16px_18px] dark:border-red-400/45 dark:bg-red-500/10">
      <AlertTriangle className="mt-0.5 h-[19px] w-[19px] shrink-0 text-red-600 dark:text-red-400" />
      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="mb-0.5 text-[13.5px] font-semibold text-foreground">
          The model hit an error
        </h2>
        <p className="mb-3 text-[13px] leading-[1.5] text-muted-foreground">
          {message ??
            'Claude couldn’t complete the refinement. This is usually transient — give it another go.'}
        </p>
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RotateCw />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
