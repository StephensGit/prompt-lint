import { describe, expect, test } from 'bun:test';
import { extractRefinedPrompt, splitSections } from './refined-prompt';

describe('extractRefinedPrompt', () => {
  test('returns empty until the value opening quote arrives', () => {
    expect(extractRefinedPrompt('')).toBe('');
    expect(extractRefinedPrompt('{')).toBe('');
    expect(extractRefinedPrompt('{"refinedPrompt"')).toBe('');
    expect(extractRefinedPrompt('{"refinedPrompt": ')).toBe('');
  });

  test('decodes a partial value mid-stream', () => {
    expect(extractRefinedPrompt('{"refinedPrompt": "## Go')).toBe('## Go');
  });

  test('un-escapes newlines, quotes and backslashes', () => {
    const raw = '{"refinedPrompt": "## Goal\\nDo \\"it\\" \\\\ now"';
    expect(extractRefinedPrompt(raw)).toBe('## Goal\nDo "it" \\ now');
  });

  test('decodes \\uXXXX escapes', () => {
    expect(extractRefinedPrompt('{"refinedPrompt": "caf\\u00e9"')).toBe('café');
  });

  test('stops cleanly on a partial trailing escape', () => {
    expect(extractRefinedPrompt('{"refinedPrompt": "line\\')).toBe('line');
    expect(extractRefinedPrompt('{"refinedPrompt": "x\\u00')).toBe('x');
  });

  test('stops at the unescaped closing quote, ignoring trailing JSON', () => {
    const raw = '{"refinedPrompt": "done", "changes": []}';
    expect(extractRefinedPrompt(raw)).toBe('done');
  });

  test('finds the key even when changes is serialised first', () => {
    const raw = '{"changes": [], "refinedPrompt": "hello"}';
    expect(extractRefinedPrompt(raw)).toBe('hello');
  });
});

describe('splitSections', () => {
  const full = [
    '## Goal',
    'Reset the dropdown.',
    '',
    '## Scope',
    'features/results/',
    '',
    '## Acceptance criteria',
    '- resets on tab switch',
    '',
    '## Constraints',
    'No new deps.',
    '',
    '## Guardrail',
    'Do not refactor unrelated code.',
  ].join('\n');

  test('segments all five sections in order', () => {
    const { sections } = splitSections(full);
    expect(sections.map((s) => s.key)).toEqual([
      'goal',
      'scope',
      'acceptance',
      'constraints',
      'guardrail',
    ]);
    expect(sections[0].body).toBe('Reset the dropdown.');
    expect(sections[2].label).toBe('Acceptance Criteria');
    expect(sections[4].body).toBe('Do not refactor unrelated code.');
  });

  test('matches headings case-insensitively', () => {
    const { sections } = splitSections('## GUARDRAIL\nkeep it focused');
    expect(sections).toHaveLength(1);
    expect(sections[0].key).toBe('guardrail');
  });

  test('does not treat a still-streaming final heading line as a block', () => {
    const { sections } = splitSections('## Goal\nDo the thing.\n## Sco');
    expect(sections.map((s) => s.key)).toEqual(['goal']);
    // The partial heading stays as body, not a leaked block.
    expect(sections[0].body).toContain('## Sco');
  });

  test('captures text before the first heading as preamble', () => {
    const { preamble, sections } = splitSections('intro\n## Goal\nbody');
    expect(preamble).toBe('intro');
    expect(sections).toHaveLength(1);
  });

  test('returns no sections for not-yet-a-heading text', () => {
    const { preamble, sections } = splitSections('## Go');
    expect(sections).toHaveLength(0);
    expect(preamble).toBe('## Go');
  });
});
