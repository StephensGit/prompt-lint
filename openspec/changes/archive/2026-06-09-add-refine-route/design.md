## Context

The `refine-contract` (request/response Zod schemas) and `meta-prompt` (`META_PROMPT`) capabilities are merged. Neither is wired to a model. This change adds `app/api/refine/route.ts` — the server-side proxy that holds `ANTHROPIC_API_KEY`, sends the rough prompt to the Anthropic Messages API with `META_PROMPT` as the system prompt, and streams the response back. The key never reaching the browser is the app's load-bearing architectural decision.

The model is `claude-sonnet-4-6` (the project default). This change introduces the project's first runtime dependency on Anthropic: `@anthropic-ai/sdk`.

The route is a **thin proxy**: it streams the model's raw text deltas straight through. It does not parse the model's JSON, validate it against `RefineResponseSchema`, or extract `refinedPrompt` / `changes` — that is the client's job in a later ticket.

## Goals / Non-Goals

**Goals:**
- A `POST /api/refine` route handler that validates input, calls Anthropic with streaming, and pipes raw text deltas back.
- `ANTHROPIC_API_KEY` read only server-side; clean failure (not a crash) when it is absent.
- Clean JSON errors on bad input (400), missing key (500), and upstream failure — never a stack trace.

**Non-Goals:**
- Parsing/validating the model's output, or any `refinedPrompt` / `changes` handling (client's job, later ticket).
- Rate limiting, caching, retries beyond the SDK's defaults.
- Any UI, component, or client fetch wiring.
- Task-type variants / presets (v2).

## Decisions

**1. Use the official `@anthropic-ai/sdk`, instantiated per request.** This is the one new dependency, explicitly in scope (overriding the repo's default "no new deps" rule for this change). Construct `new Anthropic()` inside the handler — it reads `ANTHROPIC_API_KEY` from `process.env` by default. Per-request construction keeps the key out of module scope and lets the missing-key check run per request. *Alternative considered:* raw `fetch` to the Messages API — rejected; the SDK gives typed events, typed errors (`Anthropic.APIError`), and a stream helper, and the project already commits to the SDK.

**2. Stream with `client.messages.stream()`, not `create({ stream: true })`.** The stream helper yields typed events and exposes `finalMessage()` if ever needed. We iterate `for await (const event of stream)` and forward only the text: on `content_block_delta` where `delta.type === 'text_delta'`, enqueue `delta.text`. *Alternative:* `messages.create({ stream: true })` works too but the helper is the idiomatic SDK path.

**3. Return a Web `ReadableStream` as the `Response` body; raw text, not SSE.** Next.js route handlers can return a `Response` whose body is a `ReadableStream`. In `start(controller)`, run the async iteration and `controller.enqueue(encoder.encode(delta.text))` per text delta, then `controller.close()`. `Content-Type: text/plain; charset=utf-8`. The client consumes a plain text stream — no SSE framing, matching "stream the raw text deltas straight back". The route runs on the **Node.js runtime** (the default), not edge.

**4. Leave thinking off (the default) so only answer text streams.** We do not set `thinking`, so `claude-sonnet-4-6` runs without thinking and the stream carries only the response text — exactly what should reach the client. `max_tokens` is set generously (the refined prompt + changes JSON is small; ~4096 is ample) but we stream regardless. No `temperature`/`top_p` — prompt-guided behaviour is enough.

**5. Validate before doing any work; one error shape.** Parse the JSON body inside a `try` (malformed JSON → 400), then run `parseRefineRequest`. On `ok: false`, return `400` with `{ error: string }` (or the structured field errors). The missing-key check returns `500` with the same `{ error }` shape. Every error response is clean JSON.

**6. Map upstream errors via `Anthropic.APIError.status`.** Wrap the Anthropic call. If it throws *before streaming begins*, catch it: for an `Anthropic.APIError`, respond with its `.status` (e.g. 429, 529, 500) and a clean message; otherwise a generic 502/500. Never serialise the stack.

## Risks / Trade-offs

- **A mid-stream upstream error can't change the HTTP status.** Once the first byte is enqueued, the response is committed at 200 — an error surfacing *after* streaming starts can't become a 500. Mitigation: do as much as possible (validation, key check, opening the stream) before the response commits, so the common failures surface as proper status codes; if the stream breaks mid-flight, close the stream (the client sees a truncated body). The full streamed error protocol is deferred — the client ticket can layer a trailer/sentinel if needed. Documented, accepted for v1.
- **The route streams unvalidated model output.** By design (thin proxy) the bytes are whatever the model emits — possibly not valid `RefineResponse` JSON. Accepted: parsing/validation is the client's job in a later ticket; this keeps the route a pure pipe.
- **Streaming route handlers don't unit-test cleanly** (per `docs/conventions/testing.md`). Mitigation: unit-test the non-streaming branches (400 invalid, 500 missing key) by mocking `@anthropic-ai/sdk`; verify the happy-path stream manually with `curl`, as the acceptance criteria require.
- **Key leakage into the client bundle** would defeat the whole design. Mitigation: the key is referenced only in this server route via `process.env`; an acceptance check greps the production build output to confirm it is absent. Server-only `process.env.ANTHROPIC_API_KEY` (no `NEXT_PUBLIC_` prefix) is never bundled client-side.
