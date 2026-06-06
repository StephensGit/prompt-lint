---
name: code-review
description: Use when reviewing a PR, diff, or staged changes in this Next.js + TypeScript repo, or when asked to "review", "check", or "give feedback on" frontend code. Covers correctness, RSC/client boundaries, data fetching, type safety, forms, conventions, and test coverage. Delegates performance to vercel-react-best-practices and accessibility/UX to web-design-guidelines.
---

# Code Review

You are reviewing frontend changes in a Next.js (App Router) + TypeScript + Tailwind + shadcn/ui repo. Your job is to reduce risk — catch real defects and convention drift — not to rewrite the author's code or block on taste.

This skill owns *judgment*. It does not re-list rules that other skills already own:
- **Performance** (re-renders, bundle, render-path cost) → defer to `vercel-react-best-practices`.
- **Accessibility / UX / visual** → defer to `web-design-guidelines`.
Invoke or cite those skills for findings in their area instead of inventing your own perf/a11y rules here.

## What to review (in this order)

1. **Correctness & states.** Does the change do what its proposal/PR says? Are loading, error, and empty states all handled? Edge cases (null, zero, long lists, failed fetch)?
2. **RSC / client boundary.** Is `'use client'` present only where interactivity or hooks actually require it? No server-only code (secrets, server SDKs, `fs`) leaking into a client component. Data fetched on the server where it can be.
3. **Data access.** Fetching goes through `features/<name>/api/` — never a raw `fetch` inside a component. Query keys come from a `keys.ts` factory. TanStack Query used only for genuinely client-state-heavy screens; otherwise Server Component + async fetcher.
4. **Type safety.** No `any`, no non-null `!` to silence the compiler, no unsafe casts. External/boundary data validated with Zod. Types inferred rather than hand-duplicated.
5. **Forms.** React Hook Form + Zod via `zodResolver`; shadcn `Form` components; every field has a validation message.
6. **Conventions** (`docs/conventions/web.md`). Correct feature-folder placement; route files in `app/` stay thin; `components/ui/` edited rather than wrapped; UK English in copy; no chained ternaries.
7. **Tests** (`docs/conventions/testing.md`). New logic has tests; bug fixes have a regression test that fails without the fix; tests assert behaviour, not implementation detail.
8. **Living docs.** If routes/components/hooks/data changed, the feature `OVERVIEW.md` is updated; an architectural decision has an ADR in `docs/decisions/`.

## Flag for extra scrutiny

Call these out explicitly even if they look fine: new dependencies, route or server-action contract changes, auth/permission logic, anything touching money or user data, and new global state.

## Feedback rules

- Be specific: name the file and line, and give the concrete change — not "consider improving error handling".
- Phrase uncertain points as questions: "Is `examples` guaranteed non-empty here? If not, this `.map` renders nothing silently — intended?"
- Don't block on style. Biome owns formatting; if Biome passes, say nothing about it.
- Approve when only minor issues remain. The goal is risk reduction, not perfect code.

**Bad:** "Looks good, maybe add some error handling and tests."
**Good:** "`example-list.tsx:12` — `useExamples` can return `isError`, but the component only handles `isPending` and the success path. Add an error branch (the repo pattern is an early `return` with `text-destructive`). Also missing a test for the error state — see `docs/conventions/testing.md`."

## Rationalization table — do not let yourself off the hook

| If you think… | Reality |
|---|---|
| "Tiny diff, I'll skip the checklist" | Every review runs all 8 steps. Size is not an exemption. |
| "Perf looks fine to me" | Don't eyeball perf. Defer anything in a render path to `vercel-react-best-practices`. |
| "It's just UI, no tests needed" | UI logic still gets tested. Bug fixes always get a regression test. No exceptions. |
| "The author clearly knows the codebase" | Review the code, not the author. |
| "They didn't ask me to check docs" | The post-implementation doc rule still applies. Silence is not opt-out. |

## Before posting the review, you MUST:

1. Walk all 8 review areas above — do not skip any.
2. Run (or confirm the author ran) `bun check` and `bun test`; treat failures as blocking.
3. For every issue, give file + line + a concrete fix.
4. State a clear verdict: **approve**, **approve with minors**, or **changes requested**.

A skipped step is a failed review. No exceptions for "just this once" or "it's simple enough".
