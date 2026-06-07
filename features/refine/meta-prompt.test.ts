import { describe, expect, test } from 'bun:test';
import { META_PROMPT, META_PROMPT_VERSION } from './meta-prompt';

describe('META_PROMPT', () => {
  test('is exported as a non-empty string with a version', () => {
    expect(typeof META_PROMPT).toBe('string');
    expect(META_PROMPT.trim().length).toBeGreaterThan(0);
    expect(META_PROMPT_VERSION).toBeTruthy();
  });

  test('instructs each required refining behaviour', () => {
    const prompt = META_PROMPT.toLowerCase();
    expect(prompt).toContain('definition of done');
    expect(prompt).toContain('scope');
    expect(prompt).toContain('acceptance criteria');
    expect(prompt).toContain('constraints');
    expect(prompt).toContain('guardrail');
    // The guardrail must be about leaving unrelated code alone.
    expect(prompt).toContain('unrelated');
  });

  test('mandates the intent-preserving TODO convention', () => {
    expect(META_PROMPT).toContain('[TODO: confirm');
    expect(META_PROMPT.toLowerCase()).toContain('never invent');
  });

  test('specifies the RefineResponse output contract', () => {
    // Field names must match features/refine/schema.ts so the output cannot drift.
    expect(META_PROMPT).toContain('refinedPrompt');
    expect(META_PROMPT).toContain('summary');
    expect(META_PROMPT).toContain('reason');
    expect(META_PROMPT).toContain('changes');
  });

  test('specifies the five refined-prompt section headings', () => {
    // The UI renders refinedPrompt as labelled blocks; these headings are the contract.
    expect(META_PROMPT).toContain('## Goal');
    expect(META_PROMPT).toContain('## Scope');
    expect(META_PROMPT).toContain('## Acceptance criteria');
    expect(META_PROMPT).toContain('## Constraints');
    expect(META_PROMPT).toContain('## Guardrail');
  });
});
