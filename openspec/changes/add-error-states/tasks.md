## 1. Close the gaps

- [x] 1.1 `hooks/useRefineStream.ts`: empty/unusable `refinedPrompt` → error state + Retry
  (not an empty panel).
- [x] 1.2 `components/ResultView.tsx`: failure-mode-agnostic error copy ("Something went
  wrong … Try again, or rephrase your draft"), existing `--destructive` token.
- [x] 1.3 `api/refine.ts`: remove the 30s client-side timeout (PO-confirmed); keep the
  caller cancellation `signal`; `RefineError.kind` → `model | network`; `[TODO: confirm]`
  comment for revisiting if a stuck stream appears.

## 2. Verify already-covered criteria (no change)

- [x] 2.1 5xx/4xx, network, retry, what-changed-hidden, no-infinite-spinner — confirmed
  in code (shipped ticket 5).
- [x] 2.2 Empty input — `FieldError` + disabled Refine (ticket 4); manual check noted.

## 3. Docs

- [x] 3.1 `OVERVIEW.md` updated (no timeout; error/fail-soft behaviour).

## 4. Gate

- [x] 4.1 `tsc --noEmit` clean (incl. *.test.ts); `bun test` 53 pass; Biome clean; build OK.
- [ ] 4.2 Manual: trigger 5xx / network / malformed / empty-prose and confirm inline error +
  working Retry, no console-only failures; ⌘+Enter-on-empty shows the inline message.
