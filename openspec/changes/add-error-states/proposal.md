## Why

Make every failure mode in the refine flow visible and recoverable. Much of this was
already wired in ticket 5 (the hook exposes `error`/`status: 'error'`, `ResultView` has an
error state with Retry, `page.tsx` hides `WhatChanged` while erroring). This ticket closes
the remaining gaps and settles one conflict with shipped code.

## Already covered by ticket 5 (verified, no change needed)

- 5xx/4xx → `RefineError('model', routeMessage)` → inline error + working Retry.
- Network throw → `RefineError('network', …)` → same path, no uncaught rejection.
- `WhatChanged` hidden (not skeletoned) while erroring; input stays editable.
- Retry re-runs the original prompt and clears the error on success.
- No infinite spinner: `.then`/`.catch` always resolve to `done` or `error`.

## What Changes

- `hooks/useRefineStream.ts` — **malformed/empty-prose → error.** If the final
  `refinedPrompt` is empty (even after the fail-soft decode), show the error state + Retry
  instead of an empty result panel. Surfaced in the hook (per "hook-error-surfacing only").
- `components/ResultView.tsx` — error heading was "The model hit an error" (wrong for
  network/4xx) → "Something went wrong … Try again, or rephrase your draft." Uses the
  existing `--destructive` token (no new error-colour token needed).
- `api/refine.ts` — **removed the 30s client-side timeout** (see Decision). The caller's
  cancellation `signal` stays (supersede/unmount); `RefineError.kind` is now
  `model | network` (dropped `timeout`).

## Decision: no client-side timeout (PO-confirmed)

This ticket calls for no arbitrary client-side timeout, but ticket 5 had shipped a 30s
`AbortSignal.timeout`. The contradiction was surfaced; the PO chose to **remove it** — a
fixed cap risks cutting off a legitimately slow refine. Trade-off accepted: a truly hung
stream would spin (the stream is trusted to close); a `[TODO: confirm]` marks revisiting if
a stuck stream shows up in manual testing.

## Empty input (criterion 1)

Already handled by ticket 4: `PromptInput`'s Zod `FieldError` renders the message on submit
and the Refine button is disabled while empty (no request fires). No change; worth a manual
check of the ⌘+Enter-on-empty path.

## Verification

- `bun test` 53 pass; `tsc --noEmit` 0 errors; Biome clean; `bun run build` passes.
- Manual (per ticket): simulate 5xx / network reject / malformed body / empty prose →
  inline error + Retry each time; confirm Retry recovers and no console-only failures.

## Out of Scope (guardrail)

- No route / Zod-contract / meta-prompt change; no toast library; no Playwright/e2e.
- No `WhatChanged` behaviour change beyond being hidden while erroring.

## Flags for upcoming tickets (cheap to know now)

- **Ticket 9 (responsive):** the project currently uses Tailwind's default breakpoints
  (640/768/1024/1280 — e.g. `md:` in `page.tsx`), but the design targets 375/768/1024/1440.
  Decide in ticket 9 whether to match Tailwind's `sm/md/lg/xl` or define custom `@theme`
  breakpoints. Not picked here.
- **Ticket 10 (keyboard nav):** ⌘/Ctrl+Enter is **already wired** in `PromptInput`
  (`handleKeyDown` → `form.handleSubmit`), not just the visual `⌘↵` chip. So ticket 10 is
  the rest of keyboard nav, not the shortcut itself.
