## Why

The refined prompt streams into the five blocks (ticket 5), but the "what changed
and why" list — the second half of the product — wasn't shown. The response is
already a single JSON object whose `changes` are parsed and validated on stream end
(`streamRefine` ran `RefineResponseSchema.safeParse` and then discarded them). This
change surfaces those changes and renders them in a panel beside the result.

## Approach (chosen after surfacing a discrepancy)

The ticket originally proposed a sentinel + JSON-tail rewrite ("Approach B"), premised
on the prose already streaming as raw plain text. It does not — ticket 5 ships a
single JSON object and streams the prose by incrementally decoding its `refinedPrompt`
string, and the `changes` are already parsed. We surfaced this and the chosen path is
to **consume what the pipeline already produces**: no sentinel, no second parse, no
change to the route or the streaming/JSON-decode pipeline.

## What Changes

- `api/refine.ts` — `streamRefine` now resolves with the full `RefineResponse`
  (`{ refinedPrompt, changes }`) instead of just the string. The existing authoritative
  parse is the single source; a truncated/invalid tail degrades to prose + empty
  `changes` (fail-soft).
- `hooks/useRefineStream.ts` — exposes `changes: RefineChange[]` (empty until stream
  end) alongside the existing fields.
- `components/WhatChanged.tsx` (new) — the panel: skeleton while streaming, the change
  list (summary + one-line reason, with a count badge) when done, and a quiet
  "No changes were needed." when empty.
- `app/page.tsx` — once a refine starts, lays out `ResultView` + `WhatChanged`
  side-by-side at ~60/40 on desktop (`md:grid-cols-[3fr_2fr]`), stacked on mobile; idle
  and error states stay full width.
- `features/refine/meta-prompt.ts` — **quality nudge only** (no format change). The
  `2026-06-13.1` → `2026-06-13.2` version bump is **owned by this ticket** (the `.1`
  output-format change belongs to `tighten-output-formatting`, which is already in main —
  noted here so the version history doesn't look like two unrelated tickets churned the
  file). The instruction now asks for one cohesive entry per substantive change, typically
  2–5, no per-section padding and no forced merging, each a one-line reason in the same
  plain text as the prose.
- `index.ts`, `OVERVIEW.md` — exports + docs.

## Acceptance criterion 1 (revised by PO)

The original criterion ("2–4 change items") was set before the panel had rendered anything.
A vague prompt ("clean up the auth code") legitimately produces one distinct, non-redundant
decision per heading, and capping at four would force a genuine item to vanish or fuse. So
criterion 1 is loosened to: **one cohesive item per substantive change, typically 2–5**, with
the panel enforcing no hard cap. (The earlier report marked this green against a screenshot
showing 5 — that was a reporting error; under the revised criterion it is genuinely met.)

## Verification

- Live: sample prompt → 4 items; "clean up the auth code" → 4 items (was 5 pre-nudge).
  Every reason a clean one line; prose blocks and change text have zero `**`/`_`/backtick
  artefacts; five headings still split.
- Fail-soft covered by a unit test (malformed JSON tail → result + empty changes).
- `bun test` 50 pass; `tsc --noEmit` 0 errors; Biome clean; `bun run build` passes.

## Out of Scope (guardrail)

- No changes to `app/api/refine/route.ts`, the Zod contract, or the ticket-5
  streaming/JSON-decode pipeline. No sentinel/tail format. No duplicate parsing.
- No span-to-change linking / diff view (v2), no copy button (separate ticket).
