## Why

Two UI items: (1) add the top navbar with a brand on the left and a light/dark toggle on
the right, and (2) colour-code the "What Changed" item headers. The design tokens already
ship light + dark values (apply-design-tokens), so this wires the toggle to them and uses
the hue tokens for the change headers.

## What Changes

- `components/ThemeToggle.tsx` (new, client) — icon button (lucide `Sun`/`Moon`) that
  flips the `dark` class on `<html>` and persists the choice to `localStorage`.
- `components/Navbar.tsx` (new) — left: sparkles tile + "Prompt Refiner" + tagline; right:
  `ThemeToggle`.
- `app/layout.tsx` — render `<Navbar />` above the page; add a pre-paint inline script that
  applies the stored theme (default dark) with no flash; `<html>` no longer hard-codes
  `dark` (`suppressHydrationWarning`, the script + toggle own the class now).
- `features/refine/components/WhatChanged.tsx` — each change header (summary) is coloured by
  cycling the section hue tokens (blue / violet / amber), matching the screenshot.

## Resolved TODOs (from the codebase)

- Icon library: **lucide-react** (already used everywhere).
- Theming: the **`.dark` class + existing CSS tokens** — no new theming library.
- What Changed file: `features/refine/components/WhatChanged.tsx`.

## Interpretation to confirm

The screenshot shows a small coloured **kind** label (ADDED / GUARDRAIL) above each white
summary. The change data is only `{ summary, reason }` — there is **no category/kind field**
— so a faithful "ADDED/GUARDRAIL" label can't be derived. This colours the **summary itself**
by cycling the three hues positionally (item 1 blue, 2 violet, 3 amber), which reproduces the
screenshot's look for the typical 2–4 items. True per-category colour / change↔block linking
needs the richer change model and is `add-change-linking`. `[TODO: confirm this matches intent
vs. waiting for the kind/linking data.]`

## Verification

- Live: navbar renders, theme script injected, toggle present; page 200.
- Hue tokens have light + dark values, so coloured headers stay legible in both modes.
- `tsc` 0 · `bun test` 53 pass · `bun run build` OK · Biome clean on the changed/new files
  (the `components/ui/field.tsx` + `label.tsx` errors are the pre-existing shadcn baseline).

## Out of Scope (guardrail)

- Nothing beyond the navbar and the What Changed headers. No change to the route, contract,
  meta-prompt, hook, or other components. No change↔block linking / markers (that's
  `add-change-linking`).
