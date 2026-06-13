/**
 * Helpers for turning the refine route's streamed bytes into renderable content.
 *
 * The route streams the model's raw output, and `META_PROMPT` tells the model to
 * return a single JSON object — `{ "refinedPrompt": "## Goal\n…", "changes": [...] }`
 * — with no code fences. So the bytes arriving mid-stream are *partial JSON*, not
 * clean markdown. `extractRefinedPrompt` reads the `refinedPrompt` string value out
 * of that partial JSON as it grows; `splitSections` segments the finished markdown
 * into the five labelled blocks the UI renders.
 */

const REFINED_PROMPT_KEY = '"refinedPrompt"';

/**
 * Incrementally decode the `refinedPrompt` string value from a (possibly partial)
 * JSON document. Returns the text decoded so far — safe to call on every chunk.
 *
 * It never emits the JSON wrapper, and it stops cleanly on a partial trailing
 * escape (e.g. a buffer that ends mid `\u00`), so the caller never shows a broken
 * escape sequence. Returns `''` until the value's opening quote has arrived.
 */
export function extractRefinedPrompt(raw: string): string {
  const keyAt = raw.indexOf(REFINED_PROMPT_KEY);
  if (keyAt === -1) {
    return '';
  }

  // Find the opening quote of the value: the first `"` after the key's colon.
  const colonAt = raw.indexOf(':', keyAt + REFINED_PROMPT_KEY.length);
  if (colonAt === -1) {
    return '';
  }
  const openQuoteAt = raw.indexOf('"', colonAt + 1);
  if (openQuoteAt === -1) {
    return '';
  }

  let out = '';
  for (let i = openQuoteAt + 1; i < raw.length; i += 1) {
    const ch = raw[i];

    if (ch === '"') {
      // Unescaped closing quote — the value is complete.
      return out;
    }

    if (ch !== '\\') {
      out += ch;
      continue;
    }

    // Escape sequence. If the escape is not yet fully buffered, stop without
    // emitting it — the rest will arrive on a later chunk.
    const next = raw[i + 1];
    if (next === undefined) {
      break;
    }

    if (next === 'u') {
      const hex = raw.slice(i + 2, i + 6);
      if (hex.length < 4) {
        break;
      }
      out += String.fromCharCode(Number.parseInt(hex, 16));
      i += 5;
      continue;
    }

    out += decodeShortEscape(next);
    i += 1;
  }

  return out;
}

const SHORT_ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  b: '\b',
  f: '\f',
  '"': '"',
  '\\': '\\',
  '/': '/',
};

function decodeShortEscape(char: string): string {
  return SHORT_ESCAPES[char] ?? char;
}

/** A canonical refined-prompt section, in render order. */
export type SectionKey =
  | 'goal'
  | 'scope'
  | 'acceptance'
  | 'constraints'
  | 'guardrail';

export interface RefinedSection {
  key: SectionKey;
  /** Display label, e.g. "Acceptance Criteria". */
  label: string;
  /** The section body (heading line removed, trimmed). */
  body: string;
}

interface SectionMeta {
  key: SectionKey;
  label: string;
}

/** Maps a normalised `## ` heading to its canonical section. */
const HEADING_TO_SECTION: Record<string, SectionMeta> = {
  goal: { key: 'goal', label: 'Goal' },
  scope: { key: 'scope', label: 'Scope' },
  'acceptance criteria': { key: 'acceptance', label: 'Acceptance Criteria' },
  constraints: { key: 'constraints', label: 'Constraints' },
  guardrail: { key: 'guardrail', label: 'Guardrail' },
};

const HEADING_RE = /^##\s+(.+?)\s*$/;

/**
 * Split refined markdown into its labelled sections, in the order they appear.
 *
 * `preamble` is any text before the first recognised heading (normally empty).
 * Unrecognised `## ` headings are ignored as boundaries — their text stays with
 * the preceding section — so stray model output can't invent a block. Works on
 * partial text too: a half-written trailing heading line is treated as body
 * until its newline arrives, so no half-heading leaks into a block.
 */
export function splitSections(markdown: string): {
  preamble: string;
  sections: RefinedSection[];
} {
  const lines = markdown.split('\n');
  const sections: RefinedSection[] = [];
  const preambleLines: string[] = [];
  let current: { meta: SectionMeta; bodyLines: string[] } | null = null;
  const lastIndex = lines.length - 1;

  lines.forEach((line, index) => {
    const headingMatch = line.match(HEADING_RE);
    // Only treat a heading as a boundary once its line is complete (it has a
    // following line). The still-streaming final line is never a heading yet.
    const isCompleteLine = index < lastIndex;
    const meta = headingMatch
      ? HEADING_TO_SECTION[headingMatch[1].trim().toLowerCase()]
      : undefined;

    if (meta && isCompleteLine) {
      if (current) {
        sections.push(toSection(current));
      }
      current = { meta, bodyLines: [] };
      return;
    }

    if (current) {
      current.bodyLines.push(line);
    } else {
      preambleLines.push(line);
    }
  });

  if (current) {
    sections.push(toSection(current));
  }

  return { preamble: preambleLines.join('\n').trim(), sections };
}

function toSection(current: {
  meta: SectionMeta;
  bodyLines: string[];
}): RefinedSection {
  return {
    key: current.meta.key,
    label: current.meta.label,
    body: current.bodyLines.join('\n').trim(),
  };
}
