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
}

/** The model behind the refining — shown on a completed result. */
const MODEL_LABEL = 'Refined with Claude Sonnet 4.6';

const SKELETON_WIDTHS = ['40%', '92%', '78%', '30%', '88%', '64%'];

export function ResultView({ status, text, error, onRetry }: ResultViewProps) {
  if (status === 'idle') {
    return <EmptyState />;
  }

  if (status === 'error') {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  const isStreaming = status === 'loading' || status === 'streaming';

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-(--border-strong) bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-(--border-strong) px-5 py-3">
        <h2 className="text-[13px] font-semibold text-foreground">
          Refined prompt
        </h2>
        {status === 'done' && text.length > 0 && <CopyButton text={text} />}
      </div>

      <div className="p-5">
        {status === 'loading' ? (
          <Skeleton />
        ) : (
          <RefinedPrompt text={text} isStreaming={isStreaming} />
        )}
      </div>

      {status === 'done' && (
        <div className="flex items-center gap-2 border-t border-(--border-strong) px-5 py-3">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          <span className="text-xs text-muted-foreground">{MODEL_LABEL}</span>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-border bg-(--surface) p-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            Your refined prompt appears here
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Paste a rough instruction above and hit Refine. You&apos;ll get a
            sharper, Claude Code-ready prompt plus a short &ldquo;what
            changed&rdquo;.
          </p>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <output className="flex max-w-[70ch] flex-col gap-3" aria-label="Refining…">
      {SKELETON_WIDTHS.map((width, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed, static skeleton rows
          key={index}
          className="h-4 rounded bg-muted motion-safe:animate-pulse"
          style={{ width }}
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
    <div className="flex flex-col gap-4 rounded-lg border border-destructive/40 bg-destructive/5 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            {message ?? 'Something went wrong refining your prompt.'} Try again,
            or rephrase your draft.
          </p>
        </div>
      </div>
      <div>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RotateCw />
          Try again
        </Button>
      </div>
    </div>
  );
}
