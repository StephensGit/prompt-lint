import { describe, expect, test } from 'bun:test';
import {
  MAX_PROMPT_LENGTH,
  parseRefineRequest,
  RefineRequestSchema,
  RefineResponseSchema,
} from './schema';

describe('RefineRequestSchema', () => {
  test('accepts a valid prompt', () => {
    const result = RefineRequestSchema.safeParse({
      prompt: 'add a dark mode toggle',
    });
    expect(result.success).toBe(true);
    expect(result.data?.prompt).toBe('add a dark mode toggle');
  });

  test('trims surrounding whitespace', () => {
    const result = RefineRequestSchema.safeParse({
      prompt: '  fix the build  ',
    });
    expect(result.success).toBe(true);
    expect(result.data?.prompt).toBe('fix the build');
  });

  test('rejects empty input', () => {
    const result = RefineRequestSchema.safeParse({ prompt: '' });
    expect(result.success).toBe(false);
  });

  test('rejects whitespace-only input', () => {
    const result = RefineRequestSchema.safeParse({ prompt: '   \n\t  ' });
    expect(result.success).toBe(false);
  });

  test('rejects over-length input', () => {
    const result = RefineRequestSchema.safeParse({
      prompt: 'a'.repeat(MAX_PROMPT_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });
});

describe('RefineResponseSchema', () => {
  test('accepts a well-formed response', () => {
    const response = {
      refinedPrompt: 'Add a dark mode toggle to the settings page.',
      changes: [
        {
          summary: 'Added scope',
          reason: 'The draft did not say where the toggle lives.',
        },
      ],
    };
    const result = RefineResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    expect(result.data?.refinedPrompt).toBe(response.refinedPrompt);
    expect(result.data?.changes).toHaveLength(1);
  });

  test('accepts an empty changes list', () => {
    const result = RefineResponseSchema.safeParse({
      refinedPrompt: 'Tidy the README.',
      changes: [],
    });
    expect(result.success).toBe(true);
  });

  test('rejects a missing refined prompt', () => {
    const result = RefineResponseSchema.safeParse({ changes: [] });
    expect(result.success).toBe(false);
  });

  test('rejects a malformed changes entry', () => {
    const result = RefineResponseSchema.safeParse({
      refinedPrompt: 'Tidy the README.',
      changes: [{ summary: 'Missing its reason' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('parseRefineRequest', () => {
  test('returns typed data on valid input', () => {
    const result = parseRefineRequest({ prompt: 'rename the helper' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.prompt).toBe('rename the helper');
    }
  });

  test('returns structured field errors on empty input', () => {
    const result = parseRefineRequest({ prompt: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.fieldErrors.prompt).toBeDefined();
    }
  });

  test('returns a failure rather than throwing on non-object input', () => {
    const result = parseRefineRequest(null);
    expect(result.ok).toBe(false);
  });
});
