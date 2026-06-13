## 1. Stream parsing (pure utils)

- [x] 1.1 `utils/refined-prompt.ts`: `extractRefinedPrompt(raw)` — incremental
  JSON-string decoder for the `refinedPrompt` value; handle `\n \t \r \" \\ \/ \uXXXX`
  and stop cleanly on a partial trailing escape.
- [x] 1.2 `utils/refined-prompt.ts`: `splitSections(markdown)` — segment by `## `
  headings into the five known sections (preamble + ordered sections).
- [x] 1.3 Unit tests for both (partial JSON, escapes, partial heading, full parse).

## 2. Data access + hook

- [x] 2.1 `api/refine.ts`: `streamRefine({ prompt, signal, onText })` — POST `{ prompt }`,
  read the `text/plain` stream, feed the extractor via `onText`, map the route's
  JSON error body, 30s timeout via `AbortController`.
- [x] 2.2 `hooks/useRefineStream.ts`: `{ text, status, isStreaming, error, refine, retry }`
  on plain React state; cancels any in-flight request on a new submit/unmount.

## 3. Rendering

- [x] 3.1 `app/globals.css`: add `--hue1/2/3` (light + dark) from the design handoff.
- [x] 3.2 `components/RefinedPrompt.tsx`: render the (partial) text as labelled,
  colour-coded blocks; blinking caret on the trailing block while streaming;
  neutral + `TODO: confirm` for Goal/Constraints; reduced-motion guard on the caret.
- [x] 3.3 `components/ResultView.tsx`: prop-driven; empty / loading (skeleton) /
  streaming / result / error states + "Refined with Claude Sonnet 4.6" attribution.

## 4. Wire-up + docs

- [x] 4.1 `app/page.tsx`: own the hook, pass `refine` to `PromptInput`, stream state
  to `ResultView`.
- [x] 4.2 `features/refine/index.ts`: export the hook + any new public types.
- [x] 4.3 Update `features/refine/OVERVIEW.md` (routes/components/hooks/data).

## 5. Verify

- [x] 5.1 `bun test` green (new util tests + existing suite), under the memory budget.
- [x] 5.2 `tsc --noEmit` clean; `biome check` clean.
- [ ] 5.3 Manual browser check with a real `ANTHROPIC_API_KEY`: type a draft → Refine →
  streamed five blocks + attribution, first token ~1s, no console errors; invalid
  input fires no request.
