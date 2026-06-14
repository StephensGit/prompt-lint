'use client';

import type { LucideIcon } from 'lucide-react';
import { Check, Copy, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type CopyState = 'idle' | 'copied' | 'error';

/** How long the confirmation/error state lingers before resetting to default. */
const RESET_MS = 1750;

interface CopyButtonProps {
  /** The exact refined-prompt string to copy — sourced from hook state, never the DOM. */
  text: string;
}

const VIEW: Record<
  CopyState,
  { icon: LucideIcon; label: string; className?: string }
> = {
  idle: { icon: Copy, label: 'Copy' },
  // Design calls for a green confirmation; globals.css has no green token, so this
  // uses Tailwind's palette (the only invented-free way to honour the handoff).
  copied: {
    icon: Check,
    label: 'Copied!',
    className: 'text-green-600 dark:text-green-500',
  },
  error: { icon: X, label: 'Copy failed', className: 'text-destructive' },
};

export function CopyButton({ text }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending reset if the button unmounts.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  function scheduleReset() {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setState('idle'), RESET_MS);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      // Permission denied / insecure context / unsupported — surface, don't crash.
      setState('error');
    }
    scheduleReset();
  }

  const { icon: Icon, label, className } = VIEW[state];

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label="Copy refined prompt"
      className={className}
    >
      <Icon />
      {label}
    </Button>
  );
}
