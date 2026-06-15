'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Light/dark toggle. Flips the `dark` class on <html> (the same class the design
 * tokens key off) and persists the choice to localStorage. The pre-paint script in
 * the root layout applies the stored choice on load, so there is no flash.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Sync initial state from the class the layout script already applied.
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // localStorage unavailable (private mode) — the toggle still works for the session.
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="size-9 rounded-[9px] text-muted-foreground"
    >
      {isDark ? (
        <Sun className="h-[17px] w-[17px]" />
      ) : (
        <Moon className="h-[17px] w-[17px]" />
      )}
    </Button>
  );
}
