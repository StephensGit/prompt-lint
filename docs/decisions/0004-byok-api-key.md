# ADR-0004: BYOK API key via request header

## Status: accepted
## Date: 2026-06-15

## Context
The app proxies calls to Anthropic's Messages API. Initially the plan was to hold `ANTHROPIC_API_KEY` server-side via an environment variable. This would require the operator to manage and rotate a key, and would make the hosted app a shared resource with a single billing identity.

## Decision
Remove the server-held environment key entirely. Users supply their own Anthropic API key ("bring your own key"). The key is:
- Stored in the user's browser `localStorage` under `promptlint-api-key`.
- Sent on each request as the `X-Anthropic-Key` HTTP header.
- Read by the route handler from `request.headers.get('X-Anthropic-Key')` and passed directly to the Anthropic SDK.
- Never written to a database, cache, or server log.

A settings drawer (`SettingsDrawer`) lets users save and remove their key. A demo path (`refineDemo`) serves four pre-computed examples with no API call, so the app is usable without a key.

## Reasoning
- **No billing liability**: each user pays for their own API usage; the operator has nothing to protect.
- **No secret management**: `ANTHROPIC_API_KEY` can be removed from `.env.local` and any deployment config.
- **Minimal surface for key exposure**: the key never reaches a server-side store; the only window of exposure is the in-flight HTTPS request.
- **Simple implementation**: one header read, one `Anthropic({ apiKey })` call, zero persistence on the server.

## Consequences
- Users must have an Anthropic account and API key to use the live refining path.
- The demo path mitigates the cold-start friction for new users.
- If the app moves to a paid/hosted model in the future, this decision would need revisiting (e.g. server-held key with user auth).
