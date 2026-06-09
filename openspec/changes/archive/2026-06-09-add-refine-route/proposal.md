## Why

The contract (`refine-contract`) and the system prompt (`meta-prompt`) both exist, but nothing connects them to a real model. This change adds the server route that is the heart of the app's architecture: it holds `ANTHROPIC_API_KEY` server-side, sends the rough prompt to the Anthropic Messages API with `META_PROMPT` as the system prompt, and streams the response back. The key never reaches the browser — that server-side proxy is the load-bearing decision of the whole app, and this is the change that establishes it.

## What Changes

- Add `app/api/refine/route.ts` — a `POST` handler that:
  - Validates the request body with `parseRefineRequest` / `RefineRequestSchema` from `features/refine/schema.ts`; on invalid input returns **400** with a clean JSON error.
  - Reads `ANTHROPIC_API_KEY` from `process.env`; if it is missing, returns a clean **500** rather than crashing.
  - Calls the Anthropic Messages API with `stream: true`, model `claude-sonnet-4-6`, using `META_PROMPT` as the system prompt and the validated `prompt` as the user message.
  - Streams the model's raw text deltas straight back as the response body. The route is a **thin proxy** — it does not parse or reshape the model's output.
  - Wraps the upstream call so any Anthropic/network error becomes a clean JSON error with an appropriate status, never a stack trace.
- Add `@anthropic-ai/sdk` as a dependency and use it for the call.

## Capabilities

### New Capabilities
- `refine-route`: The server-side proxy endpoint (`POST /api/refine`) — request validation, server-only key handling, the streamed Anthropic call with the meta-prompt, and clean error responses. It consumes the `refine-contract` request schema and the `meta-prompt` system prompt; it does not alter either.

### Modified Capabilities
<!-- None — refine-contract and meta-prompt are consumed unchanged. -->

## Impact

- **New code**: `app/api/refine/route.ts`.
- **New dependency**: `@anthropic-ai/sdk`. This is the one new dependency the change introduces and is **explicitly in scope** — overriding the default "no new dependencies" rule for this change only.
- **Configuration**: requires `ANTHROPIC_API_KEY` in the server environment (`.env.local` locally). Documented via `.env.example`.
- **Consumes**: `RefineRequestSchema` / `parseRefineRequest` (`features/refine/schema.ts`) and `META_PROMPT` (`features/refine/meta-prompt.ts`).
- **Security**: `ANTHROPIC_API_KEY` is read only inside this server route and must not appear in the client/production bundle.

## Out of Scope

- Rate limiting and caching (backlog).
- Any UI, components, or client-side fetch wiring (later tickets).
- Parsing or validating the model's JSON output, or any "what changed" handling — the route streams raw deltas; turning that into `refinedPrompt` + `changes` is the client's job in a later ticket.
- Task-type variants (v2).
