# Refine

## Purpose
Turns a rough, freeform coding instruction into a sharper, Claude-Code-ready prompt and lists what changed and why. This is the app's one feature.

## Routes
- `POST /api/refine` (`app/api/refine/route.ts`) — the server-side Anthropic proxy. Holds `ANTHROPIC_API_KEY` (server-only), validates the body with `parseRefineRequest`, calls the Messages API (`claude-sonnet-4-6`) with `META_PROMPT` as the system prompt, and streams the model's raw text deltas back as `text/plain`. Clean JSON errors on invalid input (400), missing key (500), and upstream failure.
- `app/page.tsx` — the single page. Renders `PromptInput` and `ResultView` in a single-column stack (input on top, empty-state result below). The Refine handler is currently a `console.log` stub; live API wiring is a later change.

## Components
- `components/PromptInput.tsx` — the composer panel. RHF + Zod (`RefineRequestSchema`) textarea with live char/word counts, "Use example" (fills the sample prompt), "Clear" (disabled when empty), primary "Refine" button (disabled when invalid), and ⌘+Enter shortcut. Accepts `onRefine: (data: RefineRequest) => void`.
- `components/ResultView.tsx` — the result placeholder. Renders the empty-state card ("Your refined prompt appears here"). No props; result-mode rendering is a later ticket.

## Structure
- `schema.ts` — the request/response **contract**: `RefineRequestSchema`, `RefineResponseSchema`, `RefineChangeSchema`, the inferred types, and the `parseRefineRequest` validation helper. Single source of truth for the refine shape; used by both the route and `PromptInput`.
- `meta-prompt.ts` — the versioned **system prompt** (`META_PROMPT`, `META_PROMPT_VERSION`) that does the refining. Treated as source code.
- `components/PromptInput.tsx`, `components/ResultView.tsx` — UI components (see above).
- `index.ts` — public exports for the feature.
- `schema.test.ts`, `meta-prompt.test.ts`, `components/PromptInput.test.tsx` — unit tests.

## Data
`RefineRequestSchema` validates the submitted prompt (trimmed, non-empty, ≤ `MAX_PROMPT_LENGTH` of 10,000 chars). `PromptInput` reuses this schema via `zodResolver` — no parallel validation. `RefineResponseSchema` defines the logical refined result (`refinedPrompt` + `changes[]`); the route streams raw text, and parsing that stream into the response shape is a later ticket.
