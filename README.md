# nextjs-ai-starter

A personal Next.js starter template with an AI-first workflow built in. Clone it, fill in two placeholder lines, and start building.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + shadcn/ui (Base UI)
- **React Hook Form** + Zod
- **TanStack Query** (optional, for client-heavy screens)
- **Bun** (runtime + package manager) + **Biome** (lint + format)
- **Bun test** + happy-dom + React Testing Library

## AI workflow

- **Claude Code** with OpenSpec for spec-driven change management
- **Skills** pre-configured: `vercel-react-best-practices`, `next-best-practices`, `web-design-guidelines`, `vercel-composition-patterns`, `shadcn`
- **CLAUDE.md** + `docs/` knowledge layer — short working instructions, living conventions, ADRs

## Using this template

### 1. Create a new project from this template

Click **Use this template** on GitHub, clone your new repo, then:

```bash
bun install
```

### 2. Fill in the two placeholders

- `CLAUDE.md` — replace `[One line: what this app does.]` with one sentence about your project
- `docs/ARCHITECTURE.md` — replace the bracketed sections with your stack and shape

### 3. Restore skills

```bash
npx skills install
```

### 4. Re-initialise OpenSpec for this project

```bash
openspec init --tools claude
```

### 5. Start building

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/              routes, layouts, server components (thin)
features/<name>/  feature logic — api, components, hooks, utils
components/ui/    shadcn primitives (your files, edit freely)
lib/              cross-cutting helpers (providers, utils, env)
docs/             conventions, decisions, templates
openspec/         spec-driven change artifacts
.claude/          skills + OpenSpec slash commands
```

## Commands

```bash
bun dev          # dev server
bun run build    # production build
bun check        # Biome lint + format, auto-fix
bun test         # unit tests
```

## Docs

- `docs/conventions/web.md` — how frontend code is written here
- `docs/conventions/testing.md` — testing patterns and gotchas
- `docs/conventions/openspec.md` — the OpenSpec workflow
- `docs/decisions/` — architectural decision records
- `docs/BOOTSTRAP.md` — how this template was built