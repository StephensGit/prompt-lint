# ADR-0002: Tailwind + shadcn/ui for styling and components

## Status: accepted
## Date: 2026-06-01

## Context
Need a styling approach and a component layer for greenfield projects. The work stack uses MUI + Emotion, but that's a heavy, dependency-owned design system tuned for a large enterprise app.

## Decision
Use Tailwind for styling and shadcn/ui for primitives — components are copied into `components/ui/` and owned in-repo, not installed as a dependency.

## Reasoning
- Owned component code is directly readable and editable by AI tools — a real edge for this repo's whole premise.
- No `sx`/theme-override fights; no library version bump silently breaking the UI.
- Pairs with the design skills (`web-design-guidelines`, `shadcn`, `tailwind-design-system`).

## Consequences
- Leaner than MUI — no batteries-included DataGrid/date-picker catalogue; compose those or pull blocks.
- You maintain the copied component code (small and stable, rarely painful).
- Gives up MUI muscle memory from work — an intentional broadening.
