## 1. Define the contract

- [x] 1.1 Create `features/refine/schema.ts` with `RefineRequestSchema`: a single `prompt` field that trims whitespace, rejects empty/whitespace-only input, and caps length at 10,000 characters.
- [x] 1.2 Add `RefineResponseSchema` to the same file: a non-empty `refinedPrompt` string and a `changes` array of `{ summary, reason }` string entries (empty array allowed).
- [x] 1.3 Export the inferred types `RefineRequest` and `RefineResponse` via `z.infer` — no hand-written type duplicating a schema.
- [x] 1.4 Add `parseRefineRequest(input: unknown)` that wraps `safeParse` and returns a discriminated result: `{ ok: true, data }` on success or `{ ok: false, errors }` (via `z.flattenError`) on failure, without throwing.

## 2. Public surface

- [x] 2.1 Create `features/refine/index.ts` exporting the request/response schemas, the inferred types, and `parseRefineRequest`.

## 3. Tests

- [x] 3.1 Create `features/refine/schema.test.ts` (Bun test, co-located) covering the request schema: accepts a valid prompt, trims surrounding whitespace, rejects empty, rejects whitespace-only, rejects over-length (10,001 chars).
- [x] 3.2 Add response-schema tests: accepts a well-formed response, accepts an empty `changes` array, rejects a missing `refinedPrompt`, rejects a `changes` entry missing `reason`.
- [x] 3.3 Add `parseRefineRequest` tests: returns typed data on valid input, returns structured field errors on `{ prompt: "" }`, returns a failure (not a throw) on `null`.

## 4. Verify

- [x] 4.1 Run `bun test` and `bun check`; confirm the suite passes and lint/format is clean.
- [x] 4.2 Add `features/refine/OVERVIEW.md` from `docs/templates/feature-overview.md`, documenting the contract as the feature's current surface.
