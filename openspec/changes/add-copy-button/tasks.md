## 1. Component

- [x] 1.1 `components/CopyButton.tsx`: shadcn `Button` (outline, sm); copy the `text`
  prop via `navigator.clipboard.writeText`; "Copied!" on resolve, "Copy failed" on
  reject; reset after ~1.75s with a single `setTimeout` cleared on unmount.

## 2. Wire into the result

- [x] 2.1 `ResultView.tsx`: render `CopyButton` in the header only when `status === 'done'`
  and text is non-empty (absent while empty/streaming). Header → flex row, no other change.

## 3. Tests + docs

- [x] 3.1 `CopyButton.test.tsx`: exact-string copy (via `mock.calls[0][0]`), success
  confirmation, reject → error state, default state. Stub `navigator.clipboard`.
- [x] 3.2 `OVERVIEW.md` updated.

## 4. Verify

- [x] 4.1 `tsc --noEmit` clean (incl. *.test.tsx); `bun test` 53 pass; Biome clean; build OK.
- [ ] 4.2 Manual: click copy on a completed refine, paste into a plain-text target and
  confirm it matches the five blocks; confirm it's absent while streaming. (Needs your eyes.)
