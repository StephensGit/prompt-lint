# PromptLint

A linter for Claude Code prompts. Paste a rough instruction and PromptLint catches what's
missing — scope, acceptance criteria, guardrails — and rewrites it into a sharper,
Claude-Code-ready prompt, with a short "what changed and why" alongside it.

> Personal / portfolio project. Single user, no accounts, no database.

## How it works

You paste a rough prompt → it's sent **server-side** to the Anthropic Messages API with a
purpose-built system prompt → you get back a structured, refined prompt (goal, scope,
acceptance criteria, constraints, guardrail) plus a list of the changes it made and why.
The output streams token-by-token so it feels fast.

The Anthropic API key lives only in the server route and is never shipped to the browser —
that proxy is the core architectural decision of the app.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + shadcn/ui (Base UI)
- **React Hook Form** + Zod (schema-first request/response contract)
- **Bun** (runtime + package manager) + **Biome** (lint + format)
- **Bun test** + happy-dom + React Testing Library
- **Anthropic Messages API** (`claude-sonnet-4-6`), called server-side and streamed

## Local development

```bash
# 1. install dependencies
bun install

# 2. add your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# 3. restore the agent skills pinned in skills-lock.json
npx skills experimental_install

# 4. run the dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

> `.env.local` is gitignored. Your `ANTHROPIC_API_KEY` must never be committed or exposed to
> the client — it's only ever read inside the server route. Commit a `.env.example` (with the
> key name but no value) so the required variable is documented.

## Commands

```bash
bun dev          # dev server
bun run build    # production build
bun check        # Biome lint + format, auto-fix
bun test         # unit tests
```

## Project structure

```
app/              routes and layouts (thin); app/api/refine/ holds the server route
features/refine/  the refine feature — schema, meta-prompt, components, hooks
components/ui/     shadcn primitives
lib/              cross-cutting helpers (providers, utils, env)
docs/             architecture, conventions, decisions
openspec/         spec-driven change artifacts
.claude/          skills + OpenSpec slash commands
```

## Docs

- `docs/ARCHITECTURE.md` — app shape and the refine request/response contract
- `docs/conventions/web.md` — how frontend code is written here
- `docs/conventions/testing.md` — testing patterns and gotchas
- `docs/conventions/openspec.md` — the OpenSpec workflow
- `docs/decisions/` — architectural decision records

## Roadmap (post-v1)

- Structured, schema-first input form (fields for goal / files / constraints / criteria)
- Task-type presets (bug fix / feature / refactor)
- Before/after diff view
- Saved, reusable prompt library