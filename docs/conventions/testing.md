# Testing Conventions

Unit/component tests run on **Bun + happy-dom + React Testing Library**. End-to-end (when needed) uses **Playwright**.

## Setup

- `happydom.ts` (repo root) registers DOM globals and is preloaded via `bunfig.toml`.
- Co-locate tests next to source as `foo.test.ts(x)`.
- Import the test API from `bun:test` (`describe`, `test`, `expect`, `mock`, `beforeAll`, `afterEach`).
- Import `act` from `react`, not from `@testing-library/react`.

## Component tests

- Use `renderWithProviders` from `test-utils/render-with-providers.tsx` (wraps the app's providers), and call `afterEach(cleanup)`.
- Don't import `cleanup` directly from `@testing-library/react` — use the one re-exported by the helper so it sees the same render tree.

## Mocking gotchas (Bun)

- Register `mock.module(...)` **inside `beforeAll`**, then `await import('./thing')` on the next line. Top-level `mock.module` runs too late because ESM hoists imports above it.
- Prefer mocking the **underlying file** (`../api/use-examples`) over a barrel (`../api`) — partial barrel mocks erase exports other tests rely on, and Bun shares mock state across files.
- Return **stable references** from hook mocks — a fresh object each call retriggers effects and can cause infinite re-renders.

## What to test

- Logic: hooks, fetchers, utils, Zod schemas.
- Components: behaviour and accessible output, not implementation detail.
- Bug fixes: a regression test that fails without the fix.
- Server Components don't unit-test cleanly — cover those flows with Playwright instead.
