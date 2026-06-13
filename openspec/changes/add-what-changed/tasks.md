## 1. Surface the parsed changes

- [x] 1.1 `api/refine.ts`: `streamRefine` resolves with the full `RefineResponse`
  (`{ refinedPrompt, changes }`); the existing parse is the single source; malformed
  tail degrades to prose + empty `changes`.
- [x] 1.2 `hooks/useRefineStream.ts`: expose `changes` (empty until stream end).
- [x] 1.3 `api/refine.test.ts`: assert changes are surfaced and that a malformed tail
  fails soft to an empty list.

## 2. Render the panel

- [x] 2.1 `components/WhatChanged.tsx`: skeleton while streaming, list (summary +
  one-line reason + count badge) when done, quiet "No changes were needed." when empty.
  Tokens pulled from `globals.css` / the design handoff; no invented values.
- [x] 2.2 `app/page.tsx`: `ResultView` + `WhatChanged` side-by-side ~60/40 on desktop,
  stacked on mobile; idle/error full width.
- [x] 2.3 `index.ts`: export `WhatChanged`.

## 3. Meta-prompt quality (conditional — was needed)

- [x] 3.1 The "auth code" probe rendered 5 (one per heading). Per PO call (option 1),
  loosen criterion 1 to "typically 2–5" and nudge the instruction to one cohesive entry
  per substantive change — no per-section padding, no forced merging. Format unchanged.
- [x] 3.2 Bump `META_PROMPT_VERSION` to `2026-06-13.2` (owned by this ticket) + changelog.

## 4. Verify

- [x] 4.1 Live: sample and "auth code" prompts → 4 items each (typically 2–5), clean
  one-line reasons; no markdown artefacts in prose or changes; five headings still split.
- [x] 4.2 `tsc --noEmit` clean (incl. *.test.ts); `bun test` passes; Biome clean; build OK.
- [ ] 4.3 Manual browser check on the running server: 60/40 layout beside the result,
  panel skeleton → items, no console errors. (Needs your eyes.)
