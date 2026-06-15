'use client';

import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const STORAGE_KEY = 'promptlint-api-key';

interface ApiKeyContextValue {
  apiKey: string;
  hasKey: boolean;
  saveKey: (key: string) => void;
  forgetKey: () => void;
  settingsOpen: boolean;
  settingsMessage: string | null;
  openSettings: (message?: string) => void;
  closeSettings: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      setApiKey(localStorage.getItem(STORAGE_KEY) ?? '');
    } catch {
      // localStorage unavailable in some sandboxed contexts
    }
  }, []);

  const saveKey = useCallback((key: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {}
    setApiKey(key);
  }, []);

  const forgetKey = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setApiKey('');
  }, []);

  const openSettings = useCallback((message?: string) => {
    setSettingsMessage(message ?? null);
    setSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    setSettingsMessage(null);
  }, []);

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        hasKey: apiKey.length > 0,
        saveKey,
        forgetKey,
        settingsOpen,
        settingsMessage,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey(): ApiKeyContextValue {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey must be used within ApiKeyProvider');
  }
  return context;
}
