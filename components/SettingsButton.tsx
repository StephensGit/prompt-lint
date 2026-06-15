'use client';

import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApiKey } from '@/lib/api-key-context';

/** Settings icon button with a green dot when an API key is saved. */
export function SettingsButton() {
  const { hasKey, openSettings } = useApiKey();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => openSettings()}
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
      {hasKey && (
        <span
          className="pointer-events-none absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
