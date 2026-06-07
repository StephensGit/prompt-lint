## Context

The `refine-contract` capability (archived) defines the `RefineResponse` shape — a `refinedPrompt` string plus a `changes` array of `{ summary, reason }`. What does not yet exist is the system prompt that instructs the model to produce that shape from a rough user prompt. The meta-prompt is treated as source code: it is the product's core judgement, and it must be reviewable on its own.

This change ships the prompt string only. There is no route, no Anthropic call, and no UI yet — so the prompt cannot be validated end-to-end against a live model here. Its correctness is verified by (a) structural checks that the required instructions are present, and (b) a line-by-line product-owner read.

## Goals / Non-Goals

**Goals:**
- A single, versioned `META_PROMPT` string in `features/refine/meta-prompt.ts`, re-exported from `features/refine/index.ts`.
- The prompt encodes all seven refining behaviours from the proposal, and instructs JSON output matching `RefineResponse`.
- The prompt is readable as prose — a reviewer can read it top to bottom and agree it is what they would write by hand.

**Non-Goals:**
- Task-type variants/presets (v2).
- The route, the Anthropic API call, the streaming/wire format, and any UI.
- Programmatically deriving the prompt's output instructions from the Zod schema (kept as deliberately-aligned prose; see Decisions).
- Few-shot examples or prompt-tuning against live model output — deferred until the route exists to test against.

## Decisions

**1. A plain string constant, not a builder function.** The prompt takes no runtime parameters in v1 (single textarea input, no presets), so a template function would add indirection for no gain. Export `META_PROMPT` as a `const` string. *Alternative considered:* a `buildMetaPrompt(opts)` function — rejected as premature; presets in v2 can introduce it then and record an ADR.

**2. Ship a version identifier alongside the prompt.** Export `META_PROMPT_VERSION` so a given refined output can be traced to the prompt revision that produced it, and so future A/B or regression work has a handle. A simple incrementing string (e.g. `'2026-06-07'` or `'v1'`) is enough — no history machinery. *Alternative:* hashing the string at runtime — rejected as overkill for a single-user app.

**3. Output-format instructions are hand-written prose aligned to the schema, kept consistent by a test.** The prompt describes the JSON shape (`refinedPrompt`, `changes[].summary`, `changes[].reason`) in words the model can follow; it does not import or stringify the Zod schema. To stop the prose drifting from `features/refine/schema.ts`, a unit test asserts the prompt mentions each `RefineResponse` field name. *Alternative considered:* generating a JSON-schema blob from Zod and embedding it — rejected for v1: it makes the prompt less readable and the contract is tiny. The route change can revisit structured-output enforcement (e.g. tool use / JSON mode) when it integrates the API.

**4. Structure the prompt as labelled sections.** Role/task framing, the seven refining rules as an explicit list, the intent-preservation rule (with the `[TODO: confirm …]` convention), and the output-format contract last. Labelled sections make both the model's job and the reviewer's read easier.

## Risks / Trade-offs

- **Prose output instructions can drift from the Zod schema** → a unit test asserts every `RefineResponse` field name appears in the prompt; if the contract changes, the test fails and forces an update.
- **No live-model validation in this change** → accepted: the prompt's behaviour is verified by structural assertions plus the PO line-by-line read now, and exercised for real when the route change lands. Treat the first version as a baseline to iterate on.
- **The model may still return prose around the JSON or invent requirements despite instructions** → out of scope to fully solve here; the prompt states the rules firmly, and robust output parsing/repair is the route's concern.
- **Structural tests assert presence of instructions, not their quality** → the product-owner line-by-line review is the real quality gate; tests only guard against accidental deletion of a required instruction.
