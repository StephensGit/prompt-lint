import { Sparkles } from 'lucide-react';

export function ResultView() {
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
