## Why

Apply the design-system foundation from the handoff so the dark UI matches the desktop
comp: blue accent, hue-coloured section labels, system mono prompt text at the right
scale, a 70ch reading cap, a stronger composer border with an accent focus ring, and
ROUGH PROMPT / RESULT / WHAT CHANGED eyebrow labels. Tokens + typography + labels only —
no behaviour, no layout-structure, no theme toggle.

## What Changes

- `app/globals.css`
  - Replaced the handoff-specified colour tokens in `:root` and `.dark` with the handoff
    values (blue `--primary` 221 83% 53% / dark 213 93% 64%, `--secondary/muted/border/
    input/ring/background/foreground/card`, `--surface`, `--border-strong`). `--hue1/2/3`
    already matched. `--radius` 0.625rem unchanged.
  - `@theme` fonts → system stacks (sans + mono); the mono stack now drives the textarea
    and refined-prompt bodies (they use `font-mono`).
- `app/layout.tsx` — removed the now-unused Geist/Geist_Mono `next/font` imports (the
  handoff mandates system stacks / no web fonts).
- `app/page.tsx` — added ROUGH PROMPT / RESULT / WHAT CHANGED eyebrow labels above the
  three panels (outside the cards), in the eyebrow type style.
- `features/refine/components/PromptInput.tsx` — composer gains an accent focus ring via
  Tailwind utilities (`focus-within:border-primary/70 focus-within:ring-[3px]
  focus-within:ring-ring/16`); the default border already uses `--border-strong`.
- `ResultView.tsx` / `WhatChanged.tsx` — card titles to 13px/600 per the scale.
- Already in place from earlier tickets: hue left-bars/labels use `hsl(var(--hueN))`
  (criterion 5); the refined-prompt column is capped at `max-w-[70ch]` (criterion 4);
  prompt text is `text-[14.5px] leading-[1.72]` (criterion 2).

## Decisions / flags (per the guardrail)

- **Token storage format.** The handoff lists tokens as bare HSL triples consumed via
  `hsl(var(--x))`. The existing codebase stores **full colour** tokens (oklch) and maps
  `@theme` as `--color-x: var(--x)`, with several components reading `bg-(--surface)` /
  `border-(--border-strong)` directly. To avoid rewriting `@theme` and every consumer,
  the handoff tokens are stored as **full `hsl(...)` colours** (identical values) and the
  hue tokens stay triples (needed for `hsl(var(--hueN) / α)` tints later). Functionally
  equivalent; flagged because it deviates from the handoff's literal triple format.
- **Tokens the handoff omits** (`popover`, `accent`, `destructive`, `chart-*`,
  `sidebar-*`) are **kept** at their previous values (guardrail: don't delete unreplaced
  tokens), so the token block is mixed hsl()/oklch.
- **`layout.tsx` touched** to drop the dead Geist web-font imports — required by the
  handoff's "no web fonts" mandate; no structural/behavioural change.
- `[TODO: confirm exact eyebrow margin-bottom from comp]` — used 8px (`mb-2`).

## Verification

- Compiled CSS contains the blue `--primary` and the system mono stack; eyebrows render;
  page loads. `tsc` 0 · `bun test` 53 pass · Biome clean · `bun run build` passes.
- Manual: side-by-side with the desktop dark comp (blue Refine button, hue labels, mono
  scale, 70ch wrap, eyebrows, focus ring). Light mode renders recognisably when toggling
  `.dark` in DevTools (not pixel-perfect; toggle ticket is next).

## Out of Scope (guardrail)

- Theme toggle / top bar; hue background tints + change↔block linking; responsive
  breakpoint changes; animations; Compact density. No behaviour/route/contract/hook change.
