# CLAUDE.md

Working instructions for this repo. Knowledge lives in `docs/` — this file points there, it does not duplicate it.

## What this is

[One line: what this app does.] Next.js (App Router) + TypeScript, styled with Tailwind + shadcn/ui.

## Before starting work

1. Read this file.
2. Read `docs/ARCHITECTURE.md` for the shape of the app.
3. Read `docs/conventions/web.md` (and `testing.md`) for the layer you're changing.
4. Read `AGENTS.md` — current Next.js + OpenSpec agent guidance, kept up to date by their CLIs.
5. Check `openspec/changes/` for work already in progress.

## Commands

```
bun dev          # dev server (http://localhost:3000)
bun run build    # production build
bun check        # Biome lint + format, auto-fix
bun test         # unit tests (bun + happy-dom)
```

## How work flows

Features and non-trivial changes go through OpenSpec: `/opsx:propose` → proposal → design → specs → tasks → `/opsx:apply`. See `docs/conventions/openspec.md`. Skip OpenSpec only for typos and one-line fixes.

## After implementing

Update the living docs so they describe how the system works *now* — not what changed, and never a changelog:

- The feature's `OVERVIEW.md` if its routes, components, hooks, or data changed.
- `docs/conventions/web.md` only if you introduced a genuinely new pattern or gotcha.
- Add an ADR in `docs/decisions/` for any architectural decision.

## Doc rules

- CLAUDE.md = working instructions (build, test, navigate). Keep it short.
- `docs/` = knowledge (conventions, decisions). It is the source of truth.
- Never copy `docs/` content into CLAUDE.md — reference it.

## Where things live

- `app/` — thin route files, layouts, server components
- `features/<name>/` — feature logic (api, components, hooks, utils, store)
- `components/ui/` — shadcn primitives (you own these files)
- `lib/` — cross-cutting helpers (providers, utils, env)
