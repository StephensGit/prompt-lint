## 1. Author the meta-prompt

- [x] 1.1 Create `features/refine/meta-prompt.ts` exporting `META_PROMPT` as a single non-empty string constant and `META_PROMPT_VERSION` as a version identifier.
- [x] 1.2 Write the role/task framing: instruct the model to rewrite a rough Claude Code prompt into a Claude-Code-ready one.
- [x] 1.3 Encode the five rewrite behaviours as explicit instructions: outcome with definition of done; explicit in/out scope (files & directories); acceptance criteria; constraints/conventions (reuse existing patterns, no new deps, style/lint); guardrail against touching/refactoring unrelated code.
- [x] 1.4 Encode the intent-preservation rule: never invent requirements; emit `[TODO: confirm …]` for genuinely missing scope or criteria instead of guessing. Includes an explicit precedence line: intent-preservation wins over rules 1–5 (prefer a TODO over an invented value).
- [x] 1.5 Encode the output-format contract: return JSON matching `RefineResponse` — a `refinedPrompt` string and a `changes` array of `{ summary, reason }` entries — using the field names from `features/refine/schema.ts`.
- [x] 1.6 Encode the refined-prompt structure — five section headings (Goal/Scope/Acceptance criteria/Constraints/Guardrail), with a `[TODO: confirm…]` kept under any heading whose information is missing.

## 2. Export and wire up

- [x] 2.1 Re-export `META_PROMPT` and `META_PROMPT_VERSION` from `features/refine/index.ts`.

## 3. Tests

- [x] 3.1 Add `features/refine/meta-prompt.test.ts` asserting `META_PROMPT` is a non-empty string and `META_PROMPT_VERSION` is defined.
- [x] 3.2 Assert the prompt mentions each required refining behaviour (definition of done, scope, acceptance criteria, constraints, unrelated-code guardrail).
- [x] 3.3 Assert the prompt mentions the `[TODO: confirm` intent-preservation convention.
- [x] 3.4 Assert the prompt mentions each `RefineResponse` field name (`refinedPrompt`, `summary`, `reason`) so the output instructions cannot silently drift from the schema.

## 4. Verify

- [x] 4.1 Run `bun test` (meta-prompt tests pass) and `bun check` (Biome clean). Meta-prompt tests pass; new files are Biome-clean. Remaining `bun check` errors are pre-existing and unrelated (app/globals.css, biome.json, components/ui/*) — left untouched.
- [x] 4.2 Update `features/refine/OVERVIEW.md` to note the meta-prompt as part of the feature.
- [x] 4.3 Product-owner read: review `META_PROMPT` line by line and confirm it is what you would write by hand.
