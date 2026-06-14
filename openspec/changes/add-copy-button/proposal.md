## Why

The refined prompt is meant to be pasted straight into Claude Code, so it needs a
one-click copy. The canonical string already lives in hook state (`text`, the parsed
`refinedPrompt`); this ticket adds a button that writes it to the clipboard and confirms.
Purely additive UI + clipboard wiring.

## What Changes

- `features/refine/components/CopyButton.tsx` (new) — composes the existing shadcn
  `Button` (outline, sm). `navigator.clipboard.writeText(text)`; on resolve shows
  "Copied!" (green, per the handoff), on reject shows "Copy failed" (`text-destructive`),
  resetting after ~1.75s via a single `setTimeout` cleared on unmount.
- `features/refine/components/ResultView.tsx` — header becomes a flex row and renders the
  `CopyButton` only when `status === 'done'` and there is text (so it is absent while
  empty or streaming). No other layout change.
- `OVERVIEW.md` — docs.

## Decisions / notes

- **Source is hook state, not the DOM.** `CopyButton` copies the `text` prop (the parsed
  `refinedPrompt`), never `innerText`/`querySelector` on the rendered blocks, so the
  payload can't drift from the model output as styling changes.
- **What-changed is excluded** — only `refinedPrompt` is copied.
- **Green confirmation:** the design calls for a green "Copied!", but `globals.css` has no
  green token, so the success state uses Tailwind's `green-600/500` (no invented hex) with
  a code comment noting it. The error state uses the existing `--destructive` token.
- No Tooltip: `components/ui` has no `tooltip.tsx`, and the ticket makes it optional, so a
  visible label is used (no new primitive/dependency).

## Verification

- Unit tests (`CopyButton.test.tsx`): writes the exact string (asserted via
  `mock.calls[0][0]`, not the DOM), shows "Copied!" on success and "Copy failed" when
  `writeText` rejects, and starts in the default state.
- `bun test` 53 pass; `tsc --noEmit` 0 errors; Biome clean; `bun run build` passes.

## Out of Scope (guardrail)

- No changes to the route, the Zod contract, the meta-prompt, the streaming/JSON-decode
  pipeline, or `WhatChanged`.
- No clipboard library and no `execCommand` legacy fallback (native Clipboard API only).
- No header restyle beyond inserting the button.
