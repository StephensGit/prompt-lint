import { Sparkles } from 'lucide-react';
import { SettingsButton } from '@/components/SettingsButton';
import { ThemeToggle } from '@/components/ThemeToggle';

/** Top navigation bar — sticky, frosted-glass, with gradient brand mark. */
export function Navbar() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/[0.82] px-[clamp(16px,4vw,32px)] py-3 backdrop-blur-[12px] backdrop-saturate-[140%]">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm ring-1 ring-inset ring-white/25">
          <Sparkles className="h-[17px] w-[17px]" strokeWidth={2.2} />
        </div>
        <span className="text-[14.5px] font-semibold tracking-[-0.01em] text-foreground">
          Prompt Refiner
        </span>
        <span className="hidden text-[12.5px] text-muted-foreground sm:inline">
          · sharpen rough prompts for Claude&nbsp;Code
        </span>
      </div>
      <div className="flex items-center gap-1">
        <SettingsButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
