## 1. Tokens + typography (globals.css)

- [x] 1.1 Replace handoff-specified colour tokens in `:root` and `.dark` (blue primary,
  secondary/muted/border/input/ring/background/foreground/card, surface, border-strong);
  keep handoff-omitted tokens; `--radius` 0.625rem.
- [x] 1.2 `@theme` fonts → system sans + system mono stacks; mono drives textarea +
  prompt bodies.
- [x] 1.3 `layout.tsx`: drop the now-unused Geist `next/font` imports (no web fonts).

## 2. Labels + composer

- [x] 2.1 `page.tsx`: ROUGH PROMPT / RESULT / WHAT CHANGED eyebrows above the panels,
  eyebrow type style, outside the cards. `[TODO: confirm margin-bottom]` → mb-2.
- [x] 2.2 `PromptInput.tsx`: accent focus ring via Tailwind utilities; default border is
  `--border-strong`.
- [x] 2.3 Card titles → 13px/600 (`ResultView`, `WhatChanged`).

## 3. Verify (already in place, confirmed)

- [x] 3.1 Hue left-bars/labels use `hsl(var(--hueN))` (criterion 5); 70ch cap (criterion 4);
  prompt mono 14.5/1.72 (criterion 2).

## 4. Gate

- [x] 4.1 Blue `--primary` + system mono present in compiled CSS; eyebrows render; page 200.
- [x] 4.2 `tsc --noEmit` clean (incl. *.test.ts); `bun test` 53 pass; Biome clean; build OK.
- [ ] 4.3 Manual: side-by-side with the desktop dark comp; manual `.dark`-toggle for a
  recognisable light render. (Needs your eyes.)
