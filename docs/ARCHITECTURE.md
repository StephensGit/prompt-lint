# Architecture

> Replace the bracketed parts when you start a new project. Keep this to one screen.

## What this app is

[1–2 sentences: what a user can do with this app, and the one-line "why it exists".]

## Stack

- **Framework:** Next.js (App Router) + TypeScript, React Server Components by default
- **Styling:** Tailwind (v4, CSS-first) + shadcn/ui primitives (owned in `components/ui/`)
- **Forms:** React Hook Form + Zod
- **Client data (when needed):** TanStack Query, wrapped in `lib/providers.tsx`
- **Tooling:** Bun (runtime + package manager), Biome (lint + format)
- **Tests:** Bun test + happy-dom + React Testing Library; Playwright for anything end-to-end

## Shape

```
app/                 routes, layouts, server components (thin — delegate to features)
features/<name>/     a feature owns its api / components / hooks / utils / store
components/ui/        shadcn primitives
lib/                  cross-cutting: providers, utils, env
docs/                 this knowledge layer (conventions, decisions, templates)
openspec/            spec-driven change artifacts
```

## Rules of thumb

- Data fetching: prefer Server Components + `async` fetchers. Reach for TanStack Query only when a screen is genuinely client-state-heavy.
- A thing starts inside a feature. It moves to `lib/` or `components/ui/` only once a second feature actually needs it (YAGNI).
- No global store (no Redux/Zustand) unless a project earns one — record that decision as an ADR.
