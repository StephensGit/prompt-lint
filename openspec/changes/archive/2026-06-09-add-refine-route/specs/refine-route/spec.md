## ADDED Requirements

### Requirement: Route streams a refined response for a valid request

The system SHALL expose a `POST /api/refine` route handler that validates the request body against `RefineRequestSchema`, calls the Anthropic Messages API with `stream: true`, model `claude-sonnet-4-6`, `META_PROMPT` as the system prompt and the validated `prompt` as the user message, and streams the model's raw text deltas back as the response body. The route SHALL act as a thin proxy and SHALL NOT parse or reshape the model's output.

#### Scenario: Valid prompt streams the model's response

- **GIVEN** a configured `ANTHROPIC_API_KEY`
- **WHEN** a `POST /api/refine` is made with body `{ "prompt": "add a dark mode toggle" }`
- **THEN** the route responds with a streamed body carrying the model's raw text deltas as they arrive
- **AND** it does not buffer, parse, or reshape that output into the `RefineResponse` shape

### Requirement: Invalid requests are rejected with a clean 400

The route SHALL validate the request body via `parseRefineRequest`. When validation fails — empty, whitespace-only, over-length (greater than `MAX_PROMPT_LENGTH`), or malformed/non-object body — the route SHALL respond with status **400** and a clean JSON error, without calling the Anthropic API.

#### Scenario: Empty prompt is rejected

- **WHEN** a `POST /api/refine` is made with body `{ "prompt": "" }`
- **THEN** the route responds with status 400 and a JSON error body
- **AND** no call to the Anthropic API is made

#### Scenario: Over-length prompt is rejected

- **GIVEN** a `prompt` longer than `MAX_PROMPT_LENGTH`
- **WHEN** it is posted to `/api/refine`
- **THEN** the route responds with status 400 and a JSON error body

#### Scenario: Malformed body is rejected

- **WHEN** a `POST /api/refine` is made with a non-object or non-JSON body
- **THEN** the route responds with status 400 and a JSON error body rather than throwing

### Requirement: Missing API key fails cleanly

When `ANTHROPIC_API_KEY` is absent from the server environment, the route SHALL respond with a clean **500** JSON error and SHALL NOT crash, leak a stack trace, or attempt the upstream call.

#### Scenario: Absent key returns a clean 500

- **GIVEN** `ANTHROPIC_API_KEY` is not set in the environment
- **WHEN** a valid `POST /api/refine` is made
- **THEN** the route responds with status 500 and a clean JSON error
- **AND** no stack trace is exposed in the response

### Requirement: Upstream errors are surfaced cleanly

The route SHALL wrap the Anthropic call so any upstream API or network error is translated into a clean JSON error response with an appropriate status code. A stack trace SHALL NOT appear in the response body.

#### Scenario: Upstream failure returns a clean error

- **GIVEN** the Anthropic API call raises an error
- **WHEN** a valid `POST /api/refine` is made
- **THEN** the route responds with a clean JSON error and an appropriate status code
- **AND** the response body contains no stack trace

### Requirement: API key stays server-side only

The `ANTHROPIC_API_KEY` SHALL be read only within the server route from `process.env` and SHALL NOT be exposed to the client. It SHALL NOT appear in the client/production bundle.

#### Scenario: Key is absent from the client bundle

- **WHEN** the production build output is searched for the value of `ANTHROPIC_API_KEY`
- **THEN** the key does not appear in any client-side or production bundle artefact
