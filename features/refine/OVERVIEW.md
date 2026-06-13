# Refine

## Purpose
Turns a rough, freeform coding instruction into a sharper, Claude-Code-ready prompt and lists what changed and why. This is the app's one feature.

## Routes
- `POST /api/refine` (`app/api/refine/route.ts`) — the server-side Anthropic proxy. Holds `ANTHROPIC_API_KEY` (server-only), validates the body with `parseRefineRequest`, calls the Messages API (`claude-sonnet-4-6`) with `META_PROMPT` as the system prompt, and streams the model's raw text deltas back as `text/plain`. Clean JSON errors on invalid input (400), missing key (500), and upstream failure.
- `app/page.tsx` — the single page (`'use client'`). Owns `useRefineStream`, passes `refine` to `PromptInput` and the stream state to `ResultView`, in a single-column stack (input on top, result below).

## Components
- `components/PromptInput.tsx` — the composer panel. RHF + Zod (`RefineRequestSchema`) textarea with live char/word counts, "Use example" (fills the sample prompt), "Clear" (disabled when empty), primary "Refine" button (disabled when invalid), and ⌘+Enter shortcut. Accepts `onRefine: (data: RefineRequest) => void`.
- `components/ResultView.tsx` — the result panel. Prop-driven (`status`, `text`, `error`, `onRetry`); renders empty / loading (skeleton) / streaming / result / error states and the "Refined with Claude Sonnet 4.6" attribution.
- `components/RefinedPrompt.tsx` — renders the (partial) refined markdown as labelled, colour-coded section blocks (Goal / Scope / Acceptance Criteria / Constraints / Guardrail) with a blinking caret on the trailing block while streaming.

## Structure
- `schema.ts` — the request/response **contract**: `RefineRequestSchema`, `RefineResponseSchema`, `RefineChangeSchema`, the inferred types, and the `parseRefineRequest` validation helper. Single source of truth for the refine shape; used by both the route and `PromptInput`.
- `meta-prompt.ts` — the versioned **system prompt** (`META_PROMPT`, `META_PROMPT_VERSION`) that does the refining. Treated as source code.
- `api/refine.ts` — `streamRefine(...)`: POSTs `{ prompt }` to `/api/refine`, reads the `text/plain` stream, decodes the refined prompt out of the partial JSON, maps route errors, 30s timeout (`RefineError`). The feature's only `fetch`.
- `hooks/useRefineStream.ts` — client hook over plain React state: `{ text, status, isStreaming, error, refine, retry }`. Cancels any in-flight request on a new submit/unmount.
- `utils/refined-prompt.ts` — pure helpers: `extractRefinedPrompt` (incremental JSON-string decoder) and `splitSections` (segment markdown into the five blocks).
- `components/*.tsx` — UI components (see above).
- `index.ts` — public exports for the feature.
- `*.test.ts(x)` — unit/integration tests, co-located.

## Data
`RefineRequestSchema` validates the submitted prompt (trimmed, non-empty, ≤ `MAX_PROMPT_LENGTH` of 10,000 chars). `PromptInput` reuses this schema via `zodResolver` — no parallel validation.

The route streams the model's **raw JSON** (`{ "refinedPrompt": "## Goal…", "changes": [...] }`) as `text/plain` deltas — not clean markdown. The client (`streamRefine` → `extractRefinedPrompt`) decodes the `refinedPrompt` string out of that growing partial JSON and renders it live; on stream end it does an authoritative `JSON.parse` validated against `RefineResponseSchema`, falling back to the incremental decode. The `changes[]` list is parsed but not yet rendered (separate "what changed" ticket).
