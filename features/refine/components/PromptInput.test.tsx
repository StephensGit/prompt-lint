import { afterEach, describe, expect, mock, test } from 'bun:test';
import type { RefineRequest } from '@/features/refine/schema';
import { EXAMPLES } from '@/lib/examples';
import {
  act,
  cleanup,
  fireEvent,
  renderWithProviders,
  screen,
} from '@/test-utils/render-with-providers';
import { PromptInput } from './PromptInput';

afterEach(cleanup);

function renderInput() {
  const onRefine = mock(
    (_data: RefineRequest, _exampleId: string | null) => {},
  );
  const onClear = mock(() => {});
  renderWithProviders(<PromptInput onRefine={onRefine} onClear={onClear} />);
  const textarea = screen.getByRole('textbox');
  return { onRefine, onClear, textarea };
}

const refineButton = () => screen.getByRole('button', { name: /refine/i });

/**
 * Drive a react-hook-form interaction and flush its async validation/submit.
 *
 * `fireEvent` alone does not await react-hook-form's async resolver, so any
 * follow-up assertion (or `waitFor`) races the pending state update. Wrapping
 * in `act` flushes it synchronously, so assertions can be synchronous too. See
 * docs/conventions/testing.md for why `waitFor` is avoided here.
 */
async function interact(fn: () => void) {
  await act(async () => {
    fn();
  });
}

describe('PromptInput', () => {
  test('shows "No input yet" on initial render', () => {
    renderInput();
    expect(screen.getByText('No input yet')).toBeTruthy();
  });

  test('updates counts as the user types', async () => {
    const { textarea } = renderInput();
    await interact(() =>
      fireEvent.change(textarea, { target: { value: 'hello world' } }),
    );
    expect(screen.getByText('11 chars · 2 words')).toBeTruthy();
  });

  test('shows "No input yet" again when input is cleared back to empty', async () => {
    const { textarea } = renderInput();
    await interact(() =>
      fireEvent.change(textarea, { target: { value: 'hello' } }),
    );
    await interact(() => fireEvent.change(textarea, { target: { value: '' } }));
    expect(screen.getByText('No input yet')).toBeTruthy();
  });

  test('Refine is disabled when textarea is empty', () => {
    renderInput();
    expect(refineButton()).toHaveProperty('disabled', true);
  });

  test('Refine is enabled after typing a valid prompt', async () => {
    const { textarea } = renderInput();
    await interact(() =>
      fireEvent.change(textarea, { target: { value: 'add dark mode' } }),
    );
    expect(refineButton()).toHaveProperty('disabled', false);
  });

  test('four example chips are shown when the composer is empty', () => {
    renderInput();
    for (const example of EXAMPLES) {
      expect(
        screen.getByRole('button', {
          name: new RegExp(`${example.label}`, 'i'),
        }),
      ).toBeTruthy();
    }
  });

  test('clicking an example chip fills the textarea and enables Refine', async () => {
    const { textarea } = renderInput();
    const firstExample = EXAMPLES[0];
    await interact(() =>
      fireEvent.click(
        screen.getByRole('button', {
          name: new RegExp(firstExample.label, 'i'),
        }),
      ),
    );
    expect((textarea as HTMLTextAreaElement).value).toBe(firstExample.input);
    expect(refineButton()).toHaveProperty('disabled', false);
  });

  test('clicking Refine after an example chip passes the exampleId', async () => {
    const { onRefine } = renderInput();
    const firstExample = EXAMPLES[0];
    await interact(() =>
      fireEvent.click(
        screen.getByRole('button', {
          name: new RegExp(firstExample.label, 'i'),
        }),
      ),
    );
    await interact(() => fireEvent.click(refineButton()));
    expect(onRefine).toHaveBeenCalledTimes(1);
    expect(onRefine.mock.calls[0][1]).toBe(firstExample.id);
  });

  test('typing after selecting a chip clears the exampleId on Refine', async () => {
    const { onRefine, textarea } = renderInput();
    const firstExample = EXAMPLES[0];
    await interact(() =>
      fireEvent.click(
        screen.getByRole('button', {
          name: new RegExp(firstExample.label, 'i'),
        }),
      ),
    );
    // User modifies the text — diverges from the example.
    await interact(() =>
      fireEvent.change(textarea, { target: { value: 'something custom' } }),
    );
    await interact(() => fireEvent.click(refineButton()));
    expect(onRefine.mock.calls[0][1]).toBeNull();
  });

  test('"Clear" empties the textarea, resets counts to "No input yet", calls onClear, and disables Refine', async () => {
    const { onClear, textarea } = renderInput();
    await interact(() =>
      fireEvent.change(textarea, { target: { value: 'some prompt' } }),
    );
    await interact(() =>
      fireEvent.click(screen.getByRole('button', { name: /clear/i })),
    );
    expect((textarea as HTMLTextAreaElement).value).toBe('');
    expect(screen.getByText('No input yet')).toBeTruthy();
    expect(refineButton()).toHaveProperty('disabled', true);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test('"Clear" is not shown when textarea is empty', () => {
    renderInput();
    // Design: Clear is hidden (not just disabled) when there is no input.
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull();
  });

  test('clicking Refine calls onRefine with the validated payload and null exampleId for custom input', async () => {
    const { onRefine, textarea } = renderInput();
    await interact(() =>
      fireEvent.change(textarea, { target: { value: '  add dark mode  ' } }),
    );
    await interact(() => fireEvent.click(refineButton()));
    // Assert the payload (first arg) only — react-hook-form also passes the
    // submit event as a second arg, and deep-comparing that happy-dom event
    // walks the whole window graph and balloons memory (see testing.md).
    expect(onRefine).toHaveBeenCalledTimes(1);
    expect(onRefine.mock.calls[0][0]).toEqual({ prompt: 'add dark mode' });
    expect(onRefine.mock.calls[0][1]).toBeNull();
  });

  test('⌘+Enter calls onRefine when the textarea is focused and input is valid', async () => {
    const { onRefine, textarea } = renderInput();
    await interact(() =>
      fireEvent.change(textarea, { target: { value: 'add dark mode' } }),
    );
    await interact(() =>
      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true }),
    );
    expect(onRefine).toHaveBeenCalledTimes(1);
    expect(onRefine.mock.calls[0][0]).toEqual({ prompt: 'add dark mode' });
  });

  test('⌘+Enter does not call onRefine when the textarea is empty', async () => {
    const { onRefine, textarea } = renderInput();
    await interact(() =>
      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true }),
    );
    expect(onRefine).not.toHaveBeenCalled();
  });
});
