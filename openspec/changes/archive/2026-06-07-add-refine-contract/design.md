## Context

PromptLint's only feature, `refine`, will eventually span a server route (the Anthropic proxy), a versioned meta-prompt, and an input/output UI. None of those can be built cleanly without a shared definition of what a refine request and response look like. The repo's `features/` directory is currently empty, and the project's non-negotiable rule is schema-first: Zod schemas are the single source of truth, with TypeScript types inferred via `z.infer`. This change lays that contract down on its own so later changes import it rather than each inventing a shape.

`zod` (^4.4.3) is already a dependency. No other code exists to integrate with yet.

## Goals / Non-Goals

**Goals:**

- Define `RefineRequestSchema` and `RefineResponseSchema` in `features/refine/schema.ts` as the single source of truth.
- Infer and export `RefineRequest` / `RefineResponse` types from those schemas.
- Provide one `parseRefineRequest` validation helper for the future route handler.
- Cover the contract with unit tests (valid, empty, whitespace-only, over-length request; well-formed and malformed response).
- Expose the contract through `features/refine/index.ts`.

**Non-Goals:**

- No `app/api/refine` route, Anthropic client, or `process.env` key handling.
- No streaming wire format. This change defines the *logical* response shape only; how it is framed over a streamed connection is the route's design, deferred.
- No meta-prompt and no UI.
- No persistence, presets, diff view, or library (v1 roadmap, out of scope).

## Decisions

**Logical contract, not the streaming envelope.** The response schema describes the complete refined result (`refinedPrompt` + `changes[]`) as a value, independent of transport. *Why:* the streaming protocol is a route concern with its own trade-offs (SSE vs. chunked text vs. structured deltas); pinning it now would over-commit this foundational change. The full-object schema still serves the route as the validation target for an assembled/parsed result. *Alternative considered:* defining a per-token delta event schema here — rejected as premature and coupling the contract to a transport choice.

**`changes` as `{ summary, reason }[]`.** Each entry pairs *what changed* with *why*, matching the product description ("lists what changed and why"). *Why:* a flat, two-field shape is the minimum that satisfies the UI's needs and keeps the model's output structure simple. *Alternative considered:* a richer entry (category, severity, before/after) — deferred; YAGNI until the UI needs it.

**`parseRefineRequest` wraps `safeParse` into a discriminated result.** Returns `{ ok: true, data }` or `{ ok: false, errors }` (errors via `z.flattenError`). *Why:* gives the route a single, throw-free entry point that maps cleanly to a 400 response, and keeps validation logic out of the route. *Alternative considered:* exporting the schema and letting the route call `.safeParse` directly — rejected because it would scatter error-shaping across callers.

**Max prompt length 10,000 characters; trim before validating.** *Why:* a coding instruction comfortably fits well under 10k; the bound guards the downstream Anthropic call from pathological input, and trimming makes whitespace-only input fail the non-empty check. *Alternative considered:* no upper bound — rejected as an unguarded passthrough to a paid API.

**Colocated test file using Bun test.** Tests live next to `schema.ts` per repo testing conventions. *Why:* the contract is pure validation logic, ideal for fast unit tests with no DOM.

## Risks / Trade-offs

- **The logical response shape may not survive contact with streaming.** → When the route change lands, it may need delta/event types. Mitigation: those build *on* this schema (e.g. a final-result validator); the field shape here is stable regardless of framing.
- **`changes` shape may prove too thin for the UI.** → If the output view later needs categories or before/after text, the schema gains optional fields — an additive, non-breaking change.
- **The 10,000-character cap is a guess.** → It is a single constant in one schema; trivially tunable once real usage shows the typical prompt size.
