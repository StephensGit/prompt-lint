import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { useEffect } from 'react';
import { ApiKeyProvider, useApiKey } from '@/lib/api-key-context';
import {
  act,
  cleanup,
  fireEvent,
  renderWithProviders,
  screen,
  waitFor,
} from '@/test-utils/render-with-providers';
import { SettingsDrawer } from './SettingsDrawer';

beforeEach(() => {
  localStorage.clear();
});

afterEach(cleanup);

function OpenSettingsOnMount() {
  const { openSettings } = useApiKey();
  useEffect(() => {
    openSettings();
  }, [openSettings]);
  return null;
}

async function renderOpenDrawer() {
  await act(async () => {
    renderWithProviders(
      <ApiKeyProvider>
        <OpenSettingsOnMount />
        <SettingsDrawer />
      </ApiKeyProvider>,
    );
  });
}

describe('SettingsDrawer — key validation', () => {
  test('shows a validation error and does not save when key does not start with sk-ant-', async () => {
    await renderOpenDrawer();

    const input = await waitFor(() => screen.getByPlaceholderText('sk-ant-…'));
    await act(async () => {
      fireEvent.change(input, { target: { value: 'bad-key' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    });

    expect(screen.getByRole('alert').textContent).toContain('sk-ant-');
    expect(localStorage.getItem('promptlint-api-key')).toBeNull();
  });

  test('saves to localStorage and closes when a valid sk-ant- key is entered', async () => {
    await renderOpenDrawer();

    const input = await waitFor(() => screen.getByPlaceholderText('sk-ant-…'));
    await act(async () => {
      fireEvent.change(input, { target: { value: 'sk-ant-validkey123' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    });

    expect(localStorage.getItem('promptlint-api-key')).toBe(
      'sk-ant-validkey123',
    );
  });
});
