# Refine

## Purpose
Turns a rough, freeform coding instruction into a sharper, Claude-Code-ready prompt and lists what changed and why. This is the app's one feature.

## Routes
- `POST /api/refine` (`app/api/refine/route.ts`) — the server-side Anthropic proxy. Holds `ANTHROPIC_API_KEY` (server-only), validates the body with `parseRefineRequest`, calls the Messages API (`claude-sonnet-4-6`) with `META_PROMPT` as the system prompt, and streams the model's raw text deltas back as `text/plain`. A thin pipe — it does not parse or reshape the output (the client does that, later). Clean JSON errors on invalid input (400), missing key (500), and upstream failure.
- The input/output UI is a separate, later change.

## Structure
- `schema.ts` — the request/response **contract**: `RefineRequestSchema`, `RefineResponseSchema`, `RefineChangeSchema`, the inferred types, and the `parseRefineRequest` validation helper. This is the single source of truth for the refine shape.
- `meta-prompt.ts` — the versioned **system prompt** (`META_PROMPT`, `META_PROMPT_VERSION`) that does the refining. Treated as source code — it is the product. Its output instructions are kept aligned with `RefineResponse`; the route (not yet built) sends it to Anthropic. The prompt instructs the model to structure `refinedPrompt` as Markdown with five labelled sections (Goal, Scope, Acceptance criteria, Constraints, Guardrail) — the contract the UI relies on to render labelled blocks.
- `index.ts` — public exports for the feature.
- `schema.test.ts`, `meta-prompt.test.ts` — unit tests for the contract and the prompt.

## Data
The contract is transport-agnostic. `RefineRequestSchema` validates the submitted prompt (trimmed, non-empty, ≤ `MAX_PROMPT_LENGTH` of 10,000 chars); `parseRefineRequest` is the throw-free entry point a route maps to a 400. `RefineResponseSchema` defines the *logical* refined result — `refinedPrompt` plus a `changes[]` of `{ summary, reason }`. How that result is framed over a streamed connection is the route's concern (not yet built).

## Current state / known issues
- The contract (schemas + types + validation helper) and the versioned meta-prompt are in place and tested.
- Not yet built: the `app/api/refine` route + Anthropic call + streaming, and the UI. Each will import the contract and the prompt.
