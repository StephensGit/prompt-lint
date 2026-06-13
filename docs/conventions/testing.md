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
- **Never assert `toHaveBeenCalledWith(...)` on a callback that receives a DOM event.** React Hook Form's `handleSubmit(cb)` invokes `cb(data, event)`, and `toHaveBeenCalledWith` deep-compares *every* argument. The happy-dom event transitively references the whole `window`/`document`, so the equality walk allocates gigabytes and can hard-freeze the machine. Assert the argument you care about instead:

  ```ts
  expect(onRefine).toHaveBeenCalledTimes(1);
  expect(onRefine.mock.calls[0][0]).toEqual({ prompt: 'add dark mode' });
  ```

- **Flush async form interactions with `act`, then assert synchronously — don't poll with `waitFor`.** `fireEvent` doesn't await RHF's async resolver, so wrap state-changing interactions in `act(async () => { fireEvent.… })` (`act` from `react`). `waitFor` re-runs its callback every tick/mutation; pairing that with a never-true assertion that walks a DOM event (point above) is what turned one test into the ~55 GB freeze.

## Mocking gotchas (Bun)

- Register `mock.module(...)` **inside `beforeAll`**, then `await import('./thing')` on the next line. Top-level `mock.module` runs too late because ESM hoists imports above it.
- Prefer mocking the **underlying file** (`../api/use-examples`) over a barrel (`../api`) — partial barrel mocks erase exports other tests rely on, and Bun shares mock state across files.
- Return **stable references** from hook mocks — a fresh object each call retriggers effects and can cause infinite re-renders.

## What to test

- Logic: hooks, fetchers, utils, Zod schemas.
- Components: behaviour and accessible output, not implementation detail.
- Bug fixes: a regression test that fails without the fix.
- Server Components don't unit-test cleanly — cover those flows with Playwright instead.
