## Why

The refine feature is the heart of PromptLint, but nothing downstream — the server route, the meta-prompt, the UI — can be built coherently until the request/response contract exists. Defining that contract first, as Zod schemas that are the single source of truth, lets every later change validate against one shared shape instead of inventing its own. This is the smallest reviewable foundation step.

## What Changes

- Add `features/refine/schema.ts` defining two Zod schemas:
  - **Request**: the rough prompt the user submits (single trimmed string, non-empty, with a sane maximum length).
  - **Response**: the refined result — the rewritten prompt plus a list of "what changed and why" entries.
- Export TypeScript types inferred from each schema via `z.infer` (never hand-written).
- Add a small `parseRefineRequest` helper that validates unknown input against the request schema and returns a typed result or structured errors, so the future route handler has one validation entry point.
- Add unit tests covering valid input, empty/whitespace input, over-length input, and a well-formed response object.
- Seed `features/refine/index.ts` with the public exports for the contract.

This change defines the contract only. It does **not** build the `app/api/refine` route, the Anthropic call, the streaming wire format, the meta-prompt, or any UI — those are separate changes that will import this contract. The logical response shape is defined here; how it is serialised over a streamed connection is the route's concern, deferred.

## Capabilities

### New Capabilities
- `refine-contract`: The validated request/response contract for the refine feature — the Zod schemas, the inferred types, and the request-validation helper that all other refine code depends on.

### Modified Capabilities
<!-- None — no existing specs in openspec/specs/. -->

## Impact

- **New code**: `features/refine/schema.ts`, `features/refine/index.ts`, and a colocated test file.
- **Dependencies**: none added — `zod` (^4.4.3) is already installed.
- **Downstream**: establishes the contract that `app/api/refine` (route + Anthropic proxy), the meta-prompt, and the input/output UI will import. No existing code is modified (the `features/` directory is currently empty).
