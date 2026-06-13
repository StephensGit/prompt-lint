## Why

The route (`app/api/refine/route.ts`) and the UI (`PromptInput`, `ResultView`)
exist but aren't connected — `app/page.tsx`'s Refine handler is a `console.log`
stub. This change wires them so a real draft produces a streamed, refined prompt
in the UI. It builds no new infrastructure.

## Key constraint discovered: the stream is JSON, not markdown

The route streams the model's **raw output**, and `META_PROMPT` instructs the model
to return a single JSON object `{ "refinedPrompt": "## Goal\n…", "changes": [...] }`
with no fences. So the bytes arriving at the client are partial JSON, not clean
markdown. The client therefore incrementally extracts the `refinedPrompt` string
value (it is the first key), un-escapes it, and renders that — never the JSON
wrapper. On stream end it does an authoritative `JSON.parse` (validated with
`RefineResponseSchema`) and falls back to the incremental extraction if that fails.
The route is **not** changed.

## What Changes

- `features/refine/utils/refined-prompt.ts` — pure, unit-tested helpers:
  - `extractRefinedPrompt(rawJson)` — incremental JSON-string decoder for the
    `refinedPrompt` value (handles `\n`, `\"`, `\\`, `\uXXXX`, and partial trailing
    escapes mid-stream).
  - `splitSections(markdown)` — split the refined markdown into the five known
    sections by `## ` headings.
- `features/refine/api/refine.ts` — `streamRefine({ prompt, signal, onText })`:
  POSTs `{ prompt }`, reads the `text/plain` `ReadableStream`, feeds the extractor,
  and surfaces clean errors (maps the route's JSON error body; 30s timeout).
- `features/refine/hooks/useRefineStream.ts` — the hook the ticket asks for:
  `{ text, status, isStreaming, error, refine, retry }` over plain React state
  (no TanStack Query, per ARCHITECTURE.md).
- `features/refine/components/RefinedPrompt.tsx` — renders the (partial) refined
  text as labelled, colour-coded section blocks with a streaming caret.
- `features/refine/components/ResultView.tsx` — now prop-driven; renders the
  empty / loading (skeleton) / streaming / result / error states and the
  "Refined with Claude Sonnet 4.6" attribution.
- `app/page.tsx` — owns the hook, passes `refine` to `PromptInput` and the stream
  state to `ResultView`.
- `app/globals.css` — add the three section-hue tokens (`--hue1/2/3`, light + dark)
  transcribed from the design handoff; they were absent.
- `features/refine/index.ts`, `features/refine/OVERVIEW.md` — exports + docs.

## Open questions (marked `TODO: confirm` in code, not guessed)

- The design handoff defines hues only for **Scope** (blue), **Acceptance criteria**
  (violet) and **Guardrail** (amber). **Goal** and **Constraints** have no hue, so
  they render with a neutral left bar and a `TODO: confirm` marker rather than an
  invented colour.
- `globals.css` (shipped) is grayscale oklch and diverged from the handoff's blue
  accent + hue tokens. This change adds only the three hue tokens needed for the
  result blocks; it does not re-do the accent (out of scope).

## Impact

- New: `api/refine.ts`, `hooks/useRefineStream.ts`, `utils/refined-prompt.ts`
  (+ test), `components/RefinedPrompt.tsx`.
- Changed: `components/ResultView.tsx`, `app/page.tsx`, `app/globals.css`,
  `index.ts`, `OVERVIEW.md`.
- No new dependencies. Key handling stays server-side (unchanged route).

## Out of Scope (guardrail)

- No changes to `route.ts`, `schema.ts`, or `META_PROMPT`.
- No "what changed" list, no copy button (separate tickets).
- No layout-direction work (Twin/Focus/Diff), theme toggle, or feature-folder
  restructure. Keep the existing single-column page.
