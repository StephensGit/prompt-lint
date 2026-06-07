## ADDED Requirements

### Requirement: Meta-prompt is exported as a versioned constant

The system SHALL export the refining system prompt from `features/refine/meta-prompt.ts` as a single non-empty string constant, accompanied by a version identifier so callers and reviewers can track which revision produced a given output. The constant SHALL be re-exported from the refine feature's public entry point (`features/refine/index.ts`).

#### Scenario: Prompt constant is exported and non-empty

- **WHEN** the meta-prompt module's exports are inspected
- **THEN** they include the prompt as a non-empty string and a version identifier

#### Scenario: Prompt is exposed from the feature entry point

- **WHEN** the refine feature's public exports (`features/refine/index.ts`) are inspected
- **THEN** they include the meta-prompt constant and its version identifier

### Requirement: Prompt instructs the model to produce a Claude-Code-ready prompt

The meta-prompt SHALL instruct the model to rewrite the user's rough prompt into a Claude-Code-optimised one, encoding all of the following refining behaviours: reframing the request as an outcome with a definition of done rather than a question; stating explicit scope (the files and directories in play, and what is out); listing acceptance criteria; surfacing constraints and conventions (reuse existing patterns, no new dependencies, style/lint); and adding a guardrail against touching or refactoring unrelated code.

#### Scenario: Prompt covers every required refining behaviour

- **GIVEN** the meta-prompt string
- **WHEN** its instructions are reviewed
- **THEN** it directs the model to produce a definition of done, explicit in/out scope, acceptance criteria, constraints/conventions, and an unrelated-code guardrail

### Requirement: Prompt preserves the user's intent

The meta-prompt SHALL instruct the model never to invent requirements the user did not express. Where scope or acceptance criteria are genuinely missing, the prompt SHALL direct the model to emit an explicit `[TODO: confirm …]` marker rather than guessing a value.

#### Scenario: Prompt forbids invented requirements and mandates TODO markers

- **GIVEN** the meta-prompt string
- **WHEN** its instructions on missing information are reviewed
- **THEN** it directs the model to leave a `[TODO: confirm …]` marker for genuinely missing scope or criteria instead of fabricating them

### Requirement: Prompt instructs output matching the RefineResponse shape

The meta-prompt SHALL instruct the model to return its result as JSON matching the `RefineResponse` contract from the `refine-contract` capability: a `refinedPrompt` string and a `changes` array whose entries each carry a `summary` and a `reason`. The output instructions SHALL stay consistent with the field names defined in `features/refine/schema.ts`.

#### Scenario: Prompt specifies the RefineResponse output contract

- **GIVEN** the meta-prompt string
- **WHEN** its output-format instructions are reviewed
- **THEN** it directs the model to return a `refinedPrompt` and a `changes` array of `{ summary, reason }` entries matching the RefineResponse schema

### Requirement: Refined prompt is structured with five labelled sections

The meta-prompt SHALL instruct the model to write `refinedPrompt` as Markdown using exactly five section headings, in order — `## Goal`, `## Scope`, `## Acceptance criteria`, `## Constraints`, `## Guardrail` — corresponding to the first five refining behaviours. This structure is the contract the UI relies on to render the result as labelled blocks. The prompt SHALL require all five headings to always be present, and SHALL direct the model to keep a heading with a `[TODO: confirm …]` marker beneath it rather than drop the section or fill it with invented content when that section's information is missing.

#### Scenario: Prompt specifies the five-heading structure

- **GIVEN** the meta-prompt string
- **WHEN** its instructions on the shape of the refined prompt are reviewed
- **THEN** it directs the model to structure `refinedPrompt` with the headings Goal, Scope, Acceptance criteria, Constraints, and Guardrail, always including all five

#### Scenario: Missing section keeps its heading with a TODO

- **GIVEN** the meta-prompt string
- **WHEN** its instructions for a section whose information is missing are reviewed
- **THEN** it directs the model to keep the heading and place a `[TODO: confirm …]` marker beneath it rather than drop the section or invent content
