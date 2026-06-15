# Refine

## Purpose
Turns a rough, freeform coding instruction into a sharper, Claude-Code-ready prompt and lists what changed and why. This is the app's one feature.

## Routes
- `POST /api/refine` (`app/api/refine/route.ts`) — the server-side Anthropic proxy. Reads the API key from the `X-Anthropic-Key` request header (BYOK — key never stored or logged). Validates the body with `parseRefineRequest`, calls the Messages API (`claude-sonnet-4-6`) with `META_PROMPT` as the system prompt, and streams the model's raw text deltas back as `text/plain`. Returns clean JSON errors on invalid input (400), missing key (400), invalid key (401), rate limit (429), and upstream failure (502/529). The key is used only for this single request then discarded.
- `app/page.tsx` — the single page (`'use client'`). Owns `useRefineStream` and `useApiKey`. Gate logic in `handleRefine`: demo chips → `refineDemo` (static, no API call); custom text + key present → `refine` (live API); custom text + no key → `openSettings`. Drives the twin-pane layout: mobile stacks input + flow-connector + result, desktop uses a CSS grid (`grid-cols-2`, kicks in at 720 px) with the input spanning both columns and result + "What changed" stacked right.

## Components
- `features/refine/components/PromptInput.tsx` — the composer panel. RHF + Zod (`RefineRequestSchema`) textarea with live char/word counts. Footer has two rows: a chip row showing four pre-computed example chips (via `EXAMPLES` from `lib/examples.ts`) when empty, or a "Clear" button when non-empty; an action row with ⌘↵ hint and "Refine" button. Accepts `onRefine(data, exampleId)` + `onClear` + optional `status`. Tracks `selectedExampleId` locally — typing clears it; the selected id is passed through to the page gate.
- `features/refine/components/ResultView.tsx` — the result panel. Prop-driven (`status`, `text`, `error`, `onRetry`, `isDemoResult`); renders empty / loading (shimmer-skeleton) / streaming / result / error states. Footer shows "Pre-computed example" when `isDemoResult` is true, "Refined with Claude Sonnet 4.6" otherwise. `CopyButton` appears in the header only when done.
- `features/refine/components/SettingsDrawer.tsx` — right-side sheet for managing the BYOK API key. Reads/writes via `useApiKey`. Password input with show/hide toggle. Validates that the key starts with `sk-ant-` before calling `saveKey`; shows inline error if invalid. `settingsMessage` (set by `openSettings(message?)`) is shown as a prompt above the input when the drawer is opened programmatically (e.g. "Add your Anthropic API key to refine your own prompts."). Rendered once in `app/layout.tsx`.
- `components/SettingsButton.tsx` — icon button in the Navbar that opens `SettingsDrawer`. Shows a green dot indicator when `hasKey` is true. Reads `useApiKey`.
- `features/refine/components/CopyButton.tsx` — copies the refined prompt via `navigator.clipboard.writeText`. Confirms with "Copied!" and resets after ~1.75s.
- `features/refine/components/RefinedPrompt.tsx` — renders the (partial) refined markdown as labelled, colour-coded section blocks (Goal / Scope / Acceptance Criteria / Constraints / Guardrail) with a blinking caret on the trailing block while streaming.
- `features/refine/components/WhatChanged.tsx` — "What changed & why" panel. Prop-driven (`changes: RefineChange[]`); renders a card per change with a positional hue-coloured check marker, summary title, and reason. Rendered only when `status === 'done'` (controlled by the page).

## Global state
- `lib/api-key-context.tsx` — `ApiKeyProvider` + `useApiKey` hook. Manages `apiKey` (read from `localStorage` on mount), `hasKey`, `saveKey`, `forgetKey`, `settingsOpen`, `settingsMessage`, `openSettings`, `closeSettings`. Wraps the whole app in `app/layout.tsx` (alongside `SettingsDrawer`) so both the Navbar and the page can access the key.

## Structure
- `schema.ts` — the request/response **contract**: `RefineRequestSchema`, `RefineResponseSchema`, `RefineChangeSchema`, the inferred types, and the `parseRefineRequest` validation helper. Single source of truth; used by both the route and `PromptInput`.
- `meta-prompt.ts` — the versioned **system prompt** (`META_PROMPT`, `META_PROMPT_VERSION`). Treated as source code.
- `api/refine.ts` — `streamRefine({ prompt, apiKey, signal, onText })`: POSTs to `/api/refine` with `X-Anthropic-Key` header, reads the `text/plain` stream, decodes the refined prompt from partial JSON, maps route/network failures to a friendly `RefineError`. Resolves with the full `RefineResponse`.
- `hooks/useRefineStream.ts` — client hook: `{ text, changes, status, isStreaming, error, isDemoResult, refine, refineDemo, reset, retry }`. `refine(data, apiKey)` starts a live API call; `refineDemo(exampleId)` sets state instantly from `EXAMPLES` (no fetch); `reset()` clears back to idle; `retry(apiKey)` re-runs the last prompt with the caller's current key.
- `utils/refined-prompt.ts` — pure helpers: `extractRefinedPrompt` (incremental JSON-string decoder) and `splitSections` (segment markdown into the five blocks).
- `index.ts` — public exports for the feature.
- `*.test.ts(x)` — unit/integration tests, co-located.

## Data
`RefineRequestSchema` validates the submitted prompt (trimmed, non-empty, ≤ `MAX_PROMPT_LENGTH` of 10,000 chars). `PromptInput` reuses this schema via `zodResolver`.

`lib/examples.ts` defines `EXAMPLES` — four pre-computed `{ id, label, tag, input, output }` entries used for the demo chips. `output` matches `RefineResponse` shape (`refinedPrompt` + `changes: RefineChange[]`), so `refineDemo` can set hook state directly without a parse step.

The route streams the model's **raw JSON** (`{ "refinedPrompt": "…", "changes": [...] }`) as `text/plain` deltas. `streamRefine` → `extractRefinedPrompt` decodes `refinedPrompt` incrementally; on stream end it does an authoritative `JSON.parse` validated against `RefineResponseSchema`. A truncated tail degrades to the incremental decode with empty `changes[]`; if even the prose is empty the hook shows the error state (with Retry).

**BYOK security model**: the API key travels only in the `X-Anthropic-Key` request header. It is never written to a database, never logged, and is discarded after the request completes. It is stored in the user's own `localStorage`; the server has no copy.
