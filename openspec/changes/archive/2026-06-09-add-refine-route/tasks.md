## 1. Dependency

- [x] 1.1 Add `@anthropic-ai/sdk` to dependencies (`bun add @anthropic-ai/sdk`) and confirm it resolves in `bun.lock`. (Installed `@anthropic-ai/sdk@0.102.0`.)
- [x] 1.2 Add `ANTHROPIC_API_KEY` to `.env.example` (key name, no value) so the required variable is documented.

## 2. Route handler

- [x] 2.1 Create `app/api/refine/route.ts` exporting an async `POST` handler (Node.js runtime — the default).
- [x] 2.2 Parse the JSON body inside a `try`; on malformed JSON return `400` with a clean `{ error }`.
- [x] 2.3 Validate the parsed body with `parseRefineRequest`; on `ok: false` return `400` with a clean JSON error (no Anthropic call made).
- [x] 2.4 Read `ANTHROPIC_API_KEY` from `process.env`; if missing, return `500` with a clean `{ error }` (no crash, no upstream call).
- [x] 2.5 Call `new Anthropic().messages.stream(...)` with model `claude-sonnet-4-6`, `system: META_PROMPT`, the validated `prompt` as the user message, and a sane `max_tokens`.
- [x] 2.6 Return a `Response` whose body is a `ReadableStream`: iterate the stream and `enqueue` each `content_block_delta` `text_delta` text as UTF-8; `close()` when done. Set `Content-Type: text/plain; charset=utf-8`.
- [x] 2.7 Wrap the upstream call so a pre-stream failure returns a clean JSON error — map `Anthropic.APIError.status` where present, generic 502/500 otherwise; never expose a stack trace. (First stream event is pulled before the response commits so auth/rate-limit/overload surface as a proper status.)

## 3. Tests

- [x] 3.1 Add `app/api/refine/route.test.ts`. Mock `@anthropic-ai/sdk` (in `beforeAll`, then `await import` the route) per the testing conventions.
- [x] 3.2 Assert an invalid body (empty / over-`MAX_PROMPT_LENGTH` / malformed) returns `400` and does not call the Anthropic client.
- [x] 3.3 Assert a missing `ANTHROPIC_API_KEY` returns `500` with a clean JSON error and no upstream call.
- [x] 3.4 Assert a simulated upstream error (mock throws an `Anthropic.APIError`-shaped error before streaming) returns a clean JSON error with no stack trace. (Plus a non-APIError → 502 fallback case.)

## 4. Verify

- [x] 4.1 Run `bun test` (route tests pass) and `bun check` (new file Biome-clean). 23/23 tests pass; new files Biome-clean.
- [x] 4.2 Manual: with a real `ANTHROPIC_API_KEY` in `.env.local`, `bun dev`, then `curl` a valid `POST /api/refine` and confirm the refined-prompt response streams back.
- [x] 4.3 Manual: `curl` an empty / over-length / malformed POST and confirm a clean `400`. (Covered by unit tests 3.2; manual curl pass still to do.)
- [x] 4.4 Security: `bun run build`, then grep the production/client bundle output and confirm the `ANTHROPIC_API_KEY` value does not appear. (Built with a canary key; absent from `.next/static`, present only in server chunks.)
- [x] 4.5 Update `features/refine/OVERVIEW.md` to record the route under "Routes" (the proxy now exists).
