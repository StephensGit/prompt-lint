'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useApiKey } from '@/lib/api-key-context';

export function SettingsDrawer() {
  const {
    apiKey,
    hasKey,
    saveKey,
    forgetKey,
    settingsOpen,
    settingsMessage,
    closeSettings,
  } = useApiKey();

  const [draft, setDraft] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Sync draft from stored key whenever the drawer opens.
  useEffect(() => {
    if (settingsOpen) {
      setDraft(apiKey);
      setKeyError(null);
      setShowKey(false);
    }
  }, [settingsOpen, apiKey]);

  function handleOpenChange(open: boolean) {
    if (!open) {
      closeSettings();
    }
  }

  function handleSave() {
    if (!draft.startsWith('sk-ant-')) {
      setKeyError('Key must start with sk-ant-');
      return;
    }
    saveKey(draft);
    closeSettings();
  }

  function handleForget() {
    forgetKey();
    setDraft('');
    closeSettings();
  }

  return (
    <Sheet open={settingsOpen} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>API Key</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4">
          {settingsMessage && (
            <p className="rounded-lg bg-muted px-3 py-2.5 text-[13px] text-foreground">
              {settingsMessage}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-ant-…"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setKeyError(null);
                }}
                className="pr-10"
                aria-invalid={keyError !== null}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {keyError && (
              <p className="text-[12px] text-destructive" role="alert">
                {keyError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleSave} className="w-full">
              Save
            </Button>
            {hasKey && (
              <Button
                variant="outline"
                onClick={handleForget}
                className="w-full"
              >
                Forget key
              </Button>
            )}
          </div>

          <p className="text-[12px] leading-[1.55] text-muted-foreground">
            Your key is sent directly to Anthropic with each request. It is
            stored in your browser&apos;s localStorage and never touches our
            servers.
          </p>

          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-primary underline-offset-3 hover:underline"
          >
            Get a key at console.anthropic.com
          </a>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
