## Why

The API route for refining prompts exists, but there is no browser UI — users cannot submit prompts or see results. This change builds the visible front end for the refine feature: the input panel, the empty-state result placeholder, and the page layout that holds them.

## What Changes

- **New `PromptInput` component** — a React Hook Form + Zod-validated textarea with live char/word counts, "Use example", "Clear", and a primary "Refine" button (⌘+Enter shortcut). Submits via a stub `onRefine` handler; no API call yet.
- **New `ResultView` component** — renders the empty-state placeholder card ("Your refined prompt appears here") from the design. No props beyond what the empty state needs; result-mode rendering belongs to a later ticket.
- **Updated `app/page.tsx`** — composes `PromptInput` and `ResultView` in the Twin desktop layout: input full-width on top, `ResultView` below. Responsive/mobile work is out of scope.
- **Updated `features/refine/index.ts`** — exports the two new components.
- **Updated `features/refine/OVERVIEW.md`** — records the new components and the page route.

## Capabilities

### New Capabilities

- `prompt-input-panel`: The composed input UI — `PromptInput` (textarea, counts, action buttons, ⌘+Enter) and `ResultView` (empty-state placeholder) — and the page layout that renders them together.

### Modified Capabilities

_(none — no existing spec-level requirements are changing)_

## Impact

- New files: `features/refine/components/PromptInput.tsx`, `features/refine/components/ResultView.tsx`, `features/refine/components/PromptInput.test.tsx`
- Modified files: `app/page.tsx`, `features/refine/index.ts`, `features/refine/OVERVIEW.md`
- New runtime dependency: `react-hook-form` (if not already installed), `@hookform/resolvers` — check `package.json` first; Zod is already present.
- No API, no server changes; the Anthropic route is untouched.
