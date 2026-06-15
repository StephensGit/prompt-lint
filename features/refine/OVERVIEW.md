# Refine

## Purpose
Turns a rough, freeform coding instruction into a sharper, Claude-Code-ready prompt and lists what changed and why. This is the app's one feature.

## Routes
- `POST /api/refine` (`app/api/refine/route.ts`) — the server-side Anthropic proxy. Holds `ANTHROPIC_API_KEY` (server-only), validates the body with `parseRefineRequest`, calls the Messages API (`claude-sonnet-4-6`) with `META_PROMPT` as the system prompt, and streams the model's raw text deltas back as `text/plain`. Clean JSON errors on invalid input (400), missing key (500), and upstream failure.
- `app/page.tsx` — the single page (`'use client'`). Owns `useRefineStream` and drives the Twin-pane layout: mobile stacks input + flow-connector + result, desktop uses a CSS grid (`grid-cols-2`, kicks in at 720 px) with the input pane sticky (`top-20`) spanning both rows and result + "What changed" stacked right. "What changed" renders only when `status === 'done'`.

## Components
- `components/PromptInput.tsx` — the composer panel. RHF + Zod (`RefineRequestSchema`) textarea with live char/word counts; "Use example" (shown only when empty) and "Clear" (shown only when non-empty and not loading) are mutually exclusive. The 44 px-tall "Refine" button shows a spinner + "Analysing…" / "Refining…" with a diagonal shimmer overlay while loading. Accepts `onRefine` + optional `status?: RefineStatus`.
- `components/ResultView.tsx` — the result panel. Prop-driven (`status`, `text`, `error`, `onRetry`); renders empty / loading (shimmer-skeleton) / streaming / result / error states. Header carries a Sparkles icon; footer shows "Refined with Claude Sonnet 4.6". Cards use `border-border`. `CopyButton` appears in the header only when done.
- `components/CopyButton.tsx` — copies the refined prompt to the clipboard via `navigator.clipboard.writeText`. Confirms with "Copied!" (or "Copy failed") and resets after ~1.75s. Rendered only when `status === 'done'`.
- `components/RefinedPrompt.tsx` — renders the (partial) refined markdown as labelled, colour-coded section blocks (Goal / Scope / Acceptance Criteria / Constraints / Guardrail) with a `steps(2,start)` blinking caret on the trailing block while streaming.
- `components/WhatChanged.tsx` — "What changed & why" panel. Prop-driven (`changes: RefineChange[]`); renders a card-per-change with a positional hue-coloured check marker (blue/violet/amber cycling), summary title, and reason. Count badge in the header. Shows "No changes were needed." when empty. Rendered only when `status === 'done'` (controlled by the page).

## Structure
- `schema.ts` — the request/response **contract**: `RefineRequestSchema`, `RefineResponseSchema`, `RefineChangeSchema`, the inferred types, and the `parseRefineRequest` validation helper. Single source of truth for the refine shape; used by both the route and `PromptInput`.
- `meta-prompt.ts` — the versioned **system prompt** (`META_PROMPT`, `META_PROMPT_VERSION`) that does the refining. Treated as source code.
- `api/refine.ts` — `streamRefine(...)`: POSTs `{ prompt }` to `/api/refine`, reads the `text/plain` stream, decodes the refined prompt out of the partial JSON, maps route/network failures to a friendly `RefineError` (`model` | `network`). Resolves with the full `RefineResponse` (prompt + changes). No client-side timeout by design — the stream ends when the server closes it. The feature's only `fetch`.
- `hooks/useRefineStream.ts` — client hook over plain React state: `{ text, changes, status, isStreaming, error, refine, retry }`. Cancels any in-flight request on a new submit/unmount.
- `utils/refined-prompt.ts` — pure helpers: `extractRefinedPrompt` (incremental JSON-string decoder) and `splitSections` (segment markdown into the five blocks).
- `components/*.tsx` — UI components (see above).
- `index.ts` — public exports for the feature.
- `*.test.ts(x)` — unit/integration tests, co-located.

## Data
`RefineRequestSchema` validates the submitted prompt (trimmed, non-empty, ≤ `MAX_PROMPT_LENGTH` of 10,000 chars). `PromptInput` reuses this schema via `zodResolver` — no parallel validation.

The route streams the model's **raw JSON** (`{ "refinedPrompt": "## Goal…", "changes": [...] }`) as `text/plain` deltas — not clean markdown. The client (`streamRefine` → `extractRefinedPrompt`) decodes the `refinedPrompt` string out of that growing partial JSON and renders it live; on stream end it does an authoritative `JSON.parse` validated against `RefineResponseSchema`. Both halves come from that single parse: `refinedPrompt` drives the blocks and `changes[]` drives the `WhatChanged` panel — there is no second parse path. A truncated/invalid tail degrades to the incremental prose decode with an empty `changes[]`, so the result still renders; but if even the prose is empty, the hook shows the error state (with Retry) rather than an empty panel. Route/network failures map to a friendly `RefineError` surfaced by the hook as `error` + `status: 'error'`; `ResultView` renders the inline message + Retry, and `page.tsx` hides `WhatChanged` while erroring.
