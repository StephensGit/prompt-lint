
## Why

The refine contract (request/response schemas) exists, but the thing that actually does the refining — the system prompt — does not. The meta-prompt is the product: it is the encoded judgement that turns a rough, freeform instruction into a Claude-Code-ready prompt. Authoring it as a standalone, versioned artifact lets the future route import one reviewed source of truth, and lets it be read and revised on its own without the route, the API call, or any UI in the way.

## What Changes

- Add `features/refine/meta-prompt.ts`, exporting the system prompt as a single versioned string constant (`META_PROMPT`).
- The prompt instructs the model to rewrite the user's rough prompt into a Claude-Code-optimised one, encoding these behaviours:
  1. Reframe the request as an **outcome with a definition of done**, not a question.
  2. Add explicit **scope** — the files/directories in play, and what is out.
  3. Add **acceptance criteria**.
  4. Surface **constraints/conventions** — reuse existing patterns, no new dependencies, style/lint.
  5. Add a **guardrail** — "do not touch or refactor unrelated code."
  6. **Preserve intent** — never invent requirements; emit `[TODO: confirm …]` where scope or criteria are genuinely missing, rather than guessing. This precedence wins over behaviours 1–5.
  7. **Structure** — write `refinedPrompt` as Markdown with five labelled sections (`## Goal`, `## Scope`, `## Acceptance criteria`, `## Constraints`, `## Guardrail`), always all five, keeping a heading with a `[TODO: confirm …]` under it when that section's information is missing. This is the contract the UI relies on to render labelled blocks.
  8. **Output format** — return JSON matching the `RefineResponse` schema (`refinedPrompt` plus a `changes` array of `{ summary, reason }`).
- Export the prompt's version alongside it so callers and reviewers can track which revision produced a given output.

This change defines the prompt string **only**. It does not build the `app/api/refine` route, the Anthropic call, the streaming wire format, or any UI — those are separate changes that import this artifact.

## Capabilities

### New Capabilities
- `meta-prompt`: The versioned system prompt that refines a rough Claude Code prompt — its required refining behaviours and the JSON output contract it instructs the model to produce, aligned to the `RefineResponse` shape from the `refine-contract` capability.

### Modified Capabilities
<!-- None — the refine-contract spec is unchanged; this capability consumes its RefineResponse shape but does not alter it. -->

## Impact

- **New code**: `features/refine/meta-prompt.ts`, plus its public export from `features/refine/index.ts`.
- **Dependencies**: none added.
- **Consumes**: the `RefineResponse` shape defined by `features/refine/schema.ts` (the archived `add-refine-contract` change) — the prompt's output instructions must match it.
- **Downstream**: establishes the system prompt that `app/api/refine` (route + Anthropic proxy) will send. No existing runtime behaviour changes — nothing imports the prompt yet.

## Out of Scope

- Task-type variants or presets (bug fix / feature / refactor) — deferred to v2.
- The route, the Anthropic API call, the streaming format, and any UI.
- Persistence or versioning history beyond a single version constant in the file.
