## Why

The five-block reasoning is correct, but the meta-prompt let the model emit inline
Markdown — `**bold**` emphasis and backticks around paths/identifiers (e.g.
`**In scope:**`, `` `ResultsTable.tsx` ``). `ResultView` renders block bodies as
plain pre-wrapped text, so those characters show up literally. This is an
output-format mismatch, fixed on the cheapest lever: have the meta-prompt emit
clean plain text. No code changes.

## What Changes

- `features/refine/meta-prompt.ts` only:
  - Add a plain-text rule to "Shape of the refined prompt": no Markdown emphasis
    (`**bold**`, `_italic_`), no backtick characters or code fences; refer to files
    and identifiers as plain words (ResultsTable.tsx, Badge, row.status). The five
    `## ` section headings — the format `splitSections` relies on — are explicitly
    kept unchanged, as are hyphen bullets and `[TODO: confirm …]` markers.
  - Bump `META_PROMPT_VERSION` `2026-06-07.2` → `2026-06-13.1` and add a changelog
    note in the header comment.

The seven reasoning behaviours and the `[TODO]`-wins-over-invention precedence are
untouched.

## Verification

Live against the running server with the new prompt:
- Rename and badge inputs → 0 backticks, 0 `**`, 0 `_`; all five headings present.
- Vague input ("make the app better") → five honest `[TODO: confirm …]` markers, no
  invented detail, still clean.
- `bun test` green; `tsc` and Biome clean.

## Out of Scope (guardrail)

- No changes to `ResultView`, the route, the Zod contract, or any component.
- No change to the section set, the heading delimiter format, the seven behaviours,
  or the `[TODO]` precedence rule.
