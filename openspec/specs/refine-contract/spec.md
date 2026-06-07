# refine-contract Specification

## Purpose

Defines the request/response contract for the refine feature: the Zod schemas that validate the submitted prompt and the refined result, a single validation entry point, and the TypeScript types inferred from those schemas. This contract is the single source of truth shared by the route, the meta-prompt code, and the UI.

## Requirements

### Requirement: Request schema validates the submitted prompt

The system SHALL define a Zod request schema for the refine feature with a single `prompt` field. The schema SHALL trim surrounding whitespace, reject empty or whitespace-only input, and reject input that exceeds the maximum length of 10,000 characters.

#### Scenario: Accepts a valid prompt

- **WHEN** an object `{ prompt: "add a dark mode toggle" }` is parsed against the request schema
- **THEN** parsing succeeds and the parsed `prompt` equals `"add a dark mode toggle"`

#### Scenario: Trims surrounding whitespace

- **GIVEN** an object `{ prompt: "  fix the build  " }`
- **WHEN** it is parsed against the request schema
- **THEN** parsing succeeds and the parsed `prompt` equals `"fix the build"`

#### Scenario: Rejects empty input

- **WHEN** an object `{ prompt: "" }` is parsed against the request schema
- **THEN** parsing fails with a validation error on the `prompt` field

#### Scenario: Rejects whitespace-only input

- **WHEN** an object `{ prompt: "   \n\t  " }` is parsed against the request schema
- **THEN** parsing fails with a validation error on the `prompt` field

#### Scenario: Rejects over-length input

- **GIVEN** a `prompt` string of 10,001 characters
- **WHEN** it is parsed against the request schema
- **THEN** parsing fails with a validation error on the `prompt` field

### Requirement: Response schema defines the refined result shape

The system SHALL define a Zod response schema for the refine feature containing the rewritten prompt (`refinedPrompt`, a non-empty string) and a `changes` list, where each entry describes what changed and why with a `summary` and a `reason` string.

#### Scenario: Accepts a well-formed response

- **GIVEN** an object with a non-empty `refinedPrompt` and a `changes` array of `{ summary, reason }` entries
- **WHEN** it is parsed against the response schema
- **THEN** parsing succeeds and the parsed object preserves `refinedPrompt` and every `changes` entry

#### Scenario: Accepts an empty changes list

- **WHEN** a response with a non-empty `refinedPrompt` and `changes: []` is parsed against the response schema
- **THEN** parsing succeeds

#### Scenario: Rejects a missing refined prompt

- **WHEN** a response object omitting `refinedPrompt` is parsed against the response schema
- **THEN** parsing fails with a validation error on the `refinedPrompt` field

#### Scenario: Rejects a malformed changes entry

- **WHEN** a response whose `changes` array contains an entry missing `reason` is parsed against the response schema
- **THEN** parsing fails with a validation error on that `changes` entry

### Requirement: Single validation entry point for requests

The system SHALL expose a `parseRefineRequest` helper that validates unknown input against the request schema and returns a discriminated result — a typed value on success, or structured field errors on failure — so callers never re-implement validation.

#### Scenario: Returns typed data on valid input

- **WHEN** `parseRefineRequest({ prompt: "rename the helper" })` is called
- **THEN** it returns a success result whose `data.prompt` equals `"rename the helper"`

#### Scenario: Returns structured errors on invalid input

- **WHEN** `parseRefineRequest({ prompt: "" })` is called
- **THEN** it returns a failure result carrying structured errors keyed to the `prompt` field

#### Scenario: Returns structured errors on non-object input

- **WHEN** `parseRefineRequest(null)` is called
- **THEN** it returns a failure result rather than throwing

### Requirement: Types are inferred from the schemas

The contract module SHALL export the request and response TypeScript types inferred from their Zod schemas via `z.infer`, with no hand-written type duplicating a schema. These inferred types are the single source of truth consumed by the route, the meta-prompt code, and the UI.

#### Scenario: Public exports expose schemas, types, and helper

- **WHEN** the refine contract module's public exports are inspected
- **THEN** they include the request schema, the response schema, the inferred request and response types, and the `parseRefineRequest` helper
