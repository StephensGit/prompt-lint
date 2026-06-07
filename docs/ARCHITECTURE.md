# Architecture

## What this app is

A linter for Claude Code prompts — flags what's missing (scope, acceptance criteria,
guardrails) and rewrites the draft, with a short "what changed and why" alongside.

Personal / portfolio project. Single user. No accounts, no database, no auth.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript, React Server Components by default
- **Styling:** Tailwind CSS v4 (CSS-first) + shadcn/ui primitives (owned in `components/ui/`)
- **Forms:** React Hook Form + Zod
- **AI:** Anthropic Messages API (`claude-sonnet-4-6`), called server-side and streamed
- **Client data (when needed):** TanStack Query, wrapped in `lib/providers.tsx` — not used in
  v1 (see *How it works*)
- **Tooling:** Bun (runtime + package manager), Biome (lint + format)
- **Tests:** Bun test + happy-dom + React Testing Library

## How it works (request flow)

1. The client posts the rough prompt to `app/api/refine` (a Route Handler).
2. That route holds `ANTHROPIC_API_KEY` (from `process.env`), calls the Anthropic Messages
   API with the versioned meta-prompt, and streams the response back. The key never reaches
   the browser — this server-side proxy is the load-bearing architectural decision.
3. The request/response contract is defined once with Zod in `features/refine/schema.ts`;
   types are inferred from it. The route validates input against it (400 on failure).
4. The meta-prompt — the system prompt that does the refining — lives in `features/refine/`
   as a versioned artifact, treated as source code (it is the product).

No database and no client data layer in v1: a single streamed fetch against the route is all
the app does, so plain React state is enough (no TanStack Query).

## Shape

```
app/
  api/refine/        server route that proxies Anthropic (holds the key, streams)
  ...                routes, layouts, server components (thin — delegate to features)
features/refine/     the refine feature: schema, meta-prompt, components, hooks, OVERVIEW.md
components/ui/        shadcn primitives
lib/                 cross-cutting: providers, utils, env
docs/                this knowledge layer (conventions, decisions, templates)
openspec/            spec-driven change artifacts
```

Each feature carries an `OVERVIEW.md` (what the feature is — its routes, components, data),
following `docs/templates/feature-overview.md`.

## Rules of thumb

- Data fetching: prefer Server Components + `async` fetchers. Reach for TanStack Query only
  when a screen is genuinely client-state-heavy (v1 isn't).
- A thing starts inside a feature. It moves to `lib/` or `components/ui/` only once a second
  feature actually needs it (YAGNI).
- No global store (no Redux/Zustand) unless a project earns one — record that decision as an ADR.
- End-to-end tests (Playwright) are deferred: v1 is a single screen, verified with unit/
  component tests plus manual testing. Add E2E only if the app grows a second surface.