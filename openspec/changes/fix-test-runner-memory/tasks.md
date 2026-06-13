## 1. Diagnose

- [x] 1.1 Confirm the three non-DOM test files (`schema`, `meta-prompt`,
  `route`) run cheaply (<100 MB) — rules out globbing / heavy imports / preload.
- [x] 1.2 Isolate the blow-up to `PromptInput.test.tsx`, then to the single
  trigger: `toHaveBeenCalledWith(...)` deep-comparing the happy-dom submit event
  that React Hook Form passes as `handleSubmit`'s second callback arg, amplified
  by `waitFor` re-running the walk every poll.
- [x] 1.3 Confirm bun's own guards (`--timeout`, `--smol`) do not bound it, so
  the trigger itself must be removed.

## 2. Fix the test

- [x] 2.1 Wrap state-changing interactions in `act(async () => …)` and assert
  synchronously; remove all `waitFor` polling of async-submit side effects.
- [x] 2.2 Assert the submit payload via `onRefine.mock.calls[0][0]` instead of
  `toHaveBeenCalledWith`, so the event is never deep-compared.
- [x] 2.3 Render with `renderWithProviders` and add `afterEach(cleanup)`, per the
  testing conventions.

## 3. Editor type resolution

- [x] 3.1 Add `bun-env.d.ts` (`/// <reference types="bun-types" />`) so editors
  resolve `bun:test` the way the `tsc` CLI already does.

## 4. Document

- [x] 4.1 Add the two rules to `docs/conventions/testing.md`: never
  `toHaveBeenCalledWith` a callback that gets a DOM event; flush form
  interactions with `act` and assert synchronously rather than polling `waitFor`.
- [x] 4.2 Record the root cause in this change's `proposal.md`.

## 5. Verify

- [x] 5.1 `bun test` runs to completion: 34 pass, ~160 MB peak RSS, ~0.4 s.
- [x] 5.2 Each single file (`schema`, `meta-prompt`, `route`, `PromptInput`)
  completes in well under a second.
- [x] 5.3 `bun check` is clean on the changed/new files.
