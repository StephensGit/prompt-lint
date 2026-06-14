import { afterEach, describe, expect, mock, test } from 'bun:test';
import {
  act,
  cleanup,
  fireEvent,
  renderWithProviders,
  screen,
} from '@/test-utils/render-with-providers';
import { CopyButton } from './CopyButton';

afterEach(cleanup);

/** Replace `navigator.clipboard` with a controllable `writeText` mock. */
function stubClipboard(writeText: (text: string) => Promise<void>) {
  const writeTextMock = mock(writeText);
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    configurable: true,
  });
  return writeTextMock;
}

describe('CopyButton', () => {
  test('writes the exact text to the clipboard and confirms with "Copied!"', async () => {
    const writeText = stubClipboard(() => Promise.resolve());
    const prompt = '## Goal\nReset the dropdown.';
    renderWithProviders(<CopyButton text={prompt} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    // Source is the passed string, not scraped from the DOM.
    expect(writeText.mock.calls[0][0]).toBe(prompt);
    expect(screen.getByText('Copied!')).toBeTruthy();
  });

  test('shows a "Copy failed" state when writeText rejects, without crashing', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')));
    renderWithProviders(<CopyButton text="anything" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(screen.getByText('Copy failed')).toBeTruthy();
  });

  test('starts in the default "Copy" state', () => {
    stubClipboard(() => Promise.resolve());
    renderWithProviders(<CopyButton text="x" />);
    expect(screen.getByText('Copy')).toBeTruthy();
  });
});
