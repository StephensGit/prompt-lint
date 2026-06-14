import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

/** Top navigation bar: brand on the left, theme toggle on the right. */
export function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-foreground">
          Prompt Refiner
        </span>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          · sharpen rough prompts for Claude Code
        </span>
      </div>
      <ThemeToggle />
    </header>
  );
}
