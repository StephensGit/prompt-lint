import { describe, expect, mock, test } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EXAMPLE_PROMPT, PromptInput } from './PromptInput';

function renderInput() {
  const onRefine = mock(() => {});
  render(<PromptInput onRefine={onRefine} />);
  const textarea = screen.getByRole('textbox');
  return { onRefine, textarea };
}

describe('PromptInput', () => {
  test('shows "No input yet" on initial render', () => {
    renderInput();
    expect(screen.getByText('No input yet')).toBeTruthy();
  });

  test('updates counts as the user types', () => {
    const { textarea } = renderInput();
    fireEvent.change(textarea, { target: { value: 'hello world' } });
    expect(screen.getByText('11 chars · 2 words')).toBeTruthy();
  });

  test('shows "No input yet" again when input is cleared back to empty', () => {
    const { textarea } = renderInput();
    fireEvent.change(textarea, { target: { value: 'hello' } });
    fireEvent.change(textarea, { target: { value: '' } });
    expect(screen.getByText('No input yet')).toBeTruthy();
  });

  test('Refine is disabled when textarea is empty', () => {
    renderInput();
    const refine = screen.getByRole('button', { name: /refine/i });
    expect(refine).toHaveProperty('disabled', true);
  });

  test('Refine is enabled after typing a valid prompt', async () => {
    const { textarea } = renderInput();
    fireEvent.change(textarea, { target: { value: 'add dark mode' } });
    await waitFor(() => {
      const refine = screen.getByRole('button', { name: /refine/i });
      expect(refine).toHaveProperty('disabled', false);
    });
  });

  test('"Use example" fills the textarea with the sample and enables Refine', async () => {
    const { textarea } = renderInput();
    fireEvent.click(screen.getByRole('button', { name: /use example/i }));
    expect((textarea as HTMLTextAreaElement).value).toBe(EXAMPLE_PROMPT);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refine/i })).toHaveProperty(
        'disabled',
        false,
      );
    });
  });

  test('"Clear" empties the textarea, resets counts to "No input yet", and disables Refine', async () => {
    const { textarea } = renderInput();
    fireEvent.change(textarea, { target: { value: 'some prompt' } });
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect((textarea as HTMLTextAreaElement).value).toBe('');
    expect(screen.getByText('No input yet')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refine/i })).toHaveProperty(
        'disabled',
        true,
      );
    });
  });

  test('"Clear" is disabled when textarea is empty', () => {
    renderInput();
    expect(screen.getByRole('button', { name: /clear/i })).toHaveProperty(
      'disabled',
      true,
    );
  });

  test('clicking Refine calls onRefine with the validated payload', async () => {
    const { onRefine, textarea } = renderInput();
    fireEvent.change(textarea, { target: { value: '  add dark mode  ' } });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /refine/i })).toHaveProperty(
        'disabled',
        false,
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: /refine/i }));
    await waitFor(() =>
      expect(onRefine).toHaveBeenCalledWith({ prompt: 'add dark mode' }),
    );
  });

  test('⌘+Enter calls onRefine when the textarea is focused and input is valid', async () => {
    const { onRefine, textarea } = renderInput();
    fireEvent.change(textarea, { target: { value: 'add dark mode' } });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /refine/i })).toHaveProperty(
        'disabled',
        false,
      ),
    );
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });
    await waitFor(() =>
      expect(onRefine).toHaveBeenCalledWith({ prompt: 'add dark mode' }),
    );
  });

  test('⌘+Enter does not call onRefine when the textarea is empty', async () => {
    const { onRefine, textarea } = renderInput();
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onRefine).not.toHaveBeenCalled();
  });
});
