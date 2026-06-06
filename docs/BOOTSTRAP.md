# Boilerplate overlay — setup runbook

This folder is the **hand-written layer** of your starter. The CLIs generate the framework, shadcn, OpenSpec, and the skills; these files add the conventions, docs, example feature, and test setup on top.

Run the steps in order, then drop these files into the repo root.

---

## 1. Scaffold the Next app

```bash
bunx create-next-app@latest your-app \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd your-app
```

At the prompts:
- **Linter → Biome** (create-next-app wires up the scripts for you)
- If it still asks about a `src/` directory, choose **No** (these files assume root-level `app/`, `features/`, `lib/`)
- Turbopack / React Compiler → defaults are fine

> create-next-app also drops an `AGENTS.md` and a stub `CLAUDE.md`. **Keep `AGENTS.md`** (it's the up-to-date Next.js agent guidance). You'll replace the stub `CLAUDE.md` in step 5.

## 2. shadcn/ui

```bash
bunx --bun shadcn@latest init
bunx --bun shadcn@latest add button input dialog form
```

`add form` pulls in React Hook Form + Zod + resolvers, so that covers forms too. `init` creates `lib/utils.ts` with `cn()` — keep it (the example component imports it).

## 3. TanStack Query (optional, only if you'll use client data)

```bash
bun add @tanstack/react-query
```

## 4. OpenSpec

```bash
npm install -g @fission-ai/openspec@latest
openspec init --tools claude
```

This creates `openspec/` and generates the `opsx` slash commands + `openspec-*` skills under `.claude/`. It also touches `AGENTS.md` — review the merge so the Next and OpenSpec guidance both survive.

## 5. Drop in this overlay

Unzip this overlay into the repo root, merging folders. It adds/overwrites:

```
CLAUDE.md                 ← replaces the create-next-app stub (references AGENTS.md + docs/)
biome.json                ← replaces the generated one (your formatting standards)
bunfig.toml               ← preloads happydom for tests
happydom.ts
docs/                     ← ARCHITECTURE, PROCESS, ACTIVE, conventions/, decisions/, templates/
features/_example/        ← reference feature (delete when you start real work)
lib/providers.tsx         ← TanStack Query provider (delete if not using Query)
test-utils/render-with-providers.tsx
```

Fill in the `[bracketed]` bits in `CLAUDE.md` and `docs/ARCHITECTURE.md` per project.

## 6. Skills (skills.sh)

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns
```

The rest of the recommended set live in their own repos — grab the exact `npx skills add` line from each one's page on skills.sh: `next-best-practices` (vercel-labs/next-skills), `shadcn` (shadcn/ui), `tailwind-design-system` (wshobson/agents), `webapp-testing` (anthropics/skills). This writes `skills-lock.json`.

Keep your own authored skills too: `skill-writing` (the engine for writing more), and — as your first exercise with it — a frontend `code-review` to replace the generic Django-flavoured one.

## 7. Test dependencies + script

```bash
bun add -d @happy-dom/global-registrator @testing-library/react @testing-library/dom
```

Add to `package.json` scripts: `"test": "bun test"`.

## 8. Wire providers (only if using Query)

In `app/layout.tsx`, wrap `{children}` in `<Providers>` from `@/lib/providers`.

## 9. Ship it as a template

create-next-app already ran `git init`. Then:

```bash
# create an EMPTY GitHub repo (no README/.gitignore — you already have them)
git remote add origin git@github.com:you/your-app.git
git add -A && git commit -m "chore: boilerplate" && git push -u origin main
```

Finally, on GitHub: **Settings → tick "Template repository."** That's the "Use this template" button you'll click for every new idea.

---

### A note on versions
The exact CLI flags and the `biome.json` schema move over time. If `bun check` complains about the schema, run `bunx --bun @biomejs/biome migrate`. If a flag is rejected, drop it and answer the prompt instead.
