## Why

`bun test` was unusable: running the suite consumed ~55 GB of RSS and hard-froze
macOS. That blocks any UI ticket from being verified. This change diagnoses the
trigger and makes the runner safe to use again.

## Root cause

The blow-up was **not** test globbing, a heavy import, or the happy-dom preload —
the three non-DOM test files run in well under 100 MB. It came from
`features/refine/components/PromptInput.test.tsx`. React Hook Form's
`handleSubmit(onRefine)` calls the callback as `onRefine(data, event)`, so the
`onRefine` mock is invoked with the submit **event** as a second argument. The
tests asserted `expect(onRefine).toHaveBeenCalledWith({ prompt: '…' })`, and
`toHaveBeenCalledWith` deep-compares *every* actual argument — including that
event. Under happy-dom the event's object graph transitively references the
entire `window`/`document`, so a single equality walk allocates well over a
gigabyte. The assertion ran inside `waitFor`, which re-invokes its callback on
every poll/mutation, multiplying that per-walk allocation into tens of gigabytes
until the machine froze. (There is no infinite render loop — with the event
excluded from the comparison the component submits cleanly in milliseconds.)

## What Changes

- Rewrite `PromptInput.test.tsx` to follow the existing testing conventions and
  avoid the trigger:
  - Drive state-changing interactions through `act(async () => …)` and assert
    synchronously, instead of polling async-submit side effects with `waitFor`.
  - Assert the submit payload via `onRefine.mock.calls[0][0]` (the `data` arg)
    rather than `toHaveBeenCalledWith`, so the happy-dom event is never
    deep-compared.
  - Render via `renderWithProviders` and register `afterEach(cleanup)`.
- Document both rules in `docs/conventions/testing.md` so future component tests
  don't reintroduce the trigger.
- Add `bun-env.d.ts` (a one-line `/// <reference types="bun-types" />`) so editors
  resolve the `bun:test` module the same way the `tsc` CLI already does.

## Impact

- **Changed**: `features/refine/components/PromptInput.test.tsx` (test-only),
  `docs/conventions/testing.md`.
- **New**: `bun-env.d.ts`.
- No source/component/route changes; no new dependencies.
- `bun test` now runs the full suite (34 tests) in ~0.4 s at ~160 MB peak RSS,
  and any single file completes in well under a second.

## Out of Scope

- Refactoring `PromptInput` or the refine route.
- The pre-existing Biome baseline errors (separate `fix-biome-baseline` change).
- Adding new tests or retroactively verifying tickets 3 and 4 — that happens
  after this lands, now that the runner is usable.
