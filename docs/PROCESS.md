# Process

The path from idea to merged code for this project. Deliberately lightweight — it's a solo repo.

```
Idea
  ↓
OpenSpec change (proposal → design → specs → tasks)   [skip for typos / one-liners]
  ↓
Implement (code + tests + living-doc updates)
  ↓
Commit / PR (Biome clean, tests green)
  ↓
Merge → deploy (Vercel)
```

## Starting work

- **Feature or non-trivial change:** `/opsx:new`, then work through proposal → design → specs → tasks, then `/opsx:apply`.
- **Bug fix:** write a failing test that reproduces it first, then fix.
- **Trivial change:** just do it. No OpenSpec ceremony for a typo or config tweak.

## Definition of done

1. Code follows `docs/conventions/web.md`.
2. Tests added/updated (see `docs/conventions/testing.md`). Bug fixes ship with a regression test.
3. Living docs updated to describe current state — the feature `OVERVIEW.md`, and an ADR if an architectural decision was made.
4. `bun check` clean, `bun test` green.

## Living documents

- `docs/conventions/*` and feature `OVERVIEW.md` files always describe the system as it is *now*.
- `docs/decisions/*` (ADRs) and archived OpenSpec changes accumulate — they're the historical record.
- Don't write "what changed" into the living docs. Git and the OpenSpec archive already hold that.
