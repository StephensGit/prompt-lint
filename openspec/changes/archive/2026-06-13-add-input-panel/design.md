## Context

`POST /api/refine` exists and streams a refined prompt. The app has no browser UI — `app/page.tsx` is a bare Next.js default. This change introduces the composer (input panel) and an empty-state result placeholder, wired together as the top portion of the chosen desktop layout from the design handoff. The Refine action calls a stub; the streaming wire-up is the next ticket.

## Goals / Non-Goals

**Goals:**
- `PromptInput` — RHF + Zod textarea with live counts, "Use example", "Clear", primary Refine button, ⌘+Enter shortcut, stub `onRefine` prop
- `ResultView` — empty-state card matching the design ("Your refined prompt appears here")
- `app/page.tsx` — renders `PromptInput` and the empty `ResultView` stacked, sized as the top of the chosen desktop layout
- Component tests covering all interactive behaviours

**Non-Goals:**
- Any `fetch` to `/api/refine` — that is the next ticket
- Rendering the refined prompt or "what changed" list
- Mobile / responsive layout — ticket 9
- Loading, streaming, error, or result states in `ResultView`
- Copy button, accessibility polish, light/dark toggle wiring

## Dependencies

Two libraries may need installing before implementation — check `package.json` / `components/ui/` first:

- **`react-hook-form` + `@hookform/resolvers`** — adding these is in scope for this change (the second deliberate dependency in the project after `@anthropic-ai/sdk`). Required for the RHF + `zodResolver` pattern documented in `docs/conventions/web.md`.
- **`components/ui/field.tsx`** (shadcn Field primitives) — if absent, add via `bunx shadcn add field`. A setup step, not a risk.

If both are already installed, no action needed.

## Decisions

### 1. RHF + Zod via `zodResolver` — reuse `RefineRequestSchema`

`RefineRequestSchema` is already the single source of truth for the request contract (validated in the route). Wiring `PromptInput` to it via `zodResolver` means the client and server validate against the same schema with no duplication. The `prompt` field's `min(1)` and `max(MAX_PROMPT_LENGTH)` rules drive the Refine button's disabled state without extra logic.

_Alternative considered_: hand-roll a `useState` with a manual length check. Rejected — duplicates the schema constraint and diverges from the `web.md` convention.

### 2. `Controller` + `Field` pattern, no `<Form>` wrapper

`web.md` documents this as the project convention: `useForm` → `Controller` → shadcn `Field` primitives. No Radix `<Form>` / `<FormField>` wrapper. The textarea is a shadcn `Textarea` inside a `Controller` render prop.

### 3. Live counts from `watch`, not DOM

`form.watch('prompt')` gives the current value on every keystroke; char count is `value.length`, word count is `value.trim().split(/\s+/).filter(Boolean).length`. No `ref`-based DOM reads needed. Falls back to `"No input yet"` when the field is empty (matching the design copy).

### 4. ⌘+Enter via `onKeyDown` on the textarea

The keyboard shortcut attaches to the textarea's `onKeyDown`: fire `form.handleSubmit(onRefine)()` only when `(e.metaKey || e.ctrlKey) && e.key === 'Enter'`. Plain `Enter` must remain a normal newline — do not `preventDefault` it, and ensure the shortcut path can't double-submit. This matches the design spec and requires no extra library.

### 5. Target layout: image 4 (single-column for now)

The chosen desktop layout is `docs/design/desktop-layout.png` (image 4 from the design pass): input panel full-width on top, refined-prompt result + what-changed sidebar **side-by-side beneath**. (Not the twin-pane / image 5 layout — that pairs rough↔refined, whereas image 4 pairs refined↔why, which is the relationship the product turns on.)

For this ticket — input only, no result rendered yet — the page renders as a single-column stack (`flex flex-col gap-6 max-w-[1240px] mx-auto px-6 py-8`): `PromptInput` on top, empty-state `ResultView` beneath. The side-by-side grid for the result and what-changed sidebar lands in ticket 5/6, beneath the input panel as image 4 dictates. Building the full grid now with empty placeholders for both columns was rejected — it adds dead CSS with nothing to show, and the empty-state card already handles the placeholder.

### 6. Stub `onRefine` prop on `PromptInput`

`PromptInput` accepts `onRefine: (data: RefineRequest) => void`. The page passes `console.log`. This keeps the component testable (inject a mock) and the interface correct for the next ticket, which will swap the stub for the real fetch.

## Risks / Trade-offs

- **Layout staging**: the page is a single-column stack here; the side-by-side result + what-changed grid lands in ticket 5/6 once there is real content to fill it. Accepted — image 4's grid only makes sense once the result is rendering.