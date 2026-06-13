## 1. Setup

- [ ] 1.1 Add the shadcn Textarea primitive: `bunx shadcn add textarea`. Confirm `components/ui/textarea.tsx` is created.

## 2. `PromptInput` component

- [ ] 2.1 Create `features/refine/components/PromptInput.tsx`. Wire `useForm` with `zodResolver(RefineRequestSchema)` and `defaultValues: { prompt: '' }`. Accept an `onRefine: (data: RefineRequest) => void` prop.
- [ ] 2.2 Render a `Controller` for the `prompt` field wrapping a shadcn `Textarea` (monospace font class, at least 6 visible rows) inside a `Field`. Apply `data-invalid` and `aria-invalid` per the `web.md` convention.
- [ ] 2.3 Add live counts below the textarea using `form.watch('prompt')`: display `"<N> chars · <W> words"` when non-empty, `"No input yet"` when empty. Word count: `value.trim().split(/\s+/).filter(Boolean).length`.
- [ ] 2.4 Add the "Use example" button (ghost, `Wand2` icon). On click: `form.setValue('prompt', EXAMPLE_PROMPT, { shouldValidate: true })`. Define `EXAMPLE_PROMPT` as `"the status dropdown on the results table keeps its value when you switch tabs, it should reset to default. fix it"`.
- [ ] 2.5 Add the "Clear" button (ghost, `X` icon). On click: `form.reset()`. Disable when `prompt` value is empty (derive from `watch`).
- [ ] 2.6 Add the primary "Refine" button (`Sparkles` icon). Bind to `form.handleSubmit(onRefine)`. Disable when the form is invalid (derive from `formState.isValid`).
- [ ] 2.7 Attach `onKeyDown` to the `Textarea`: when `(e.metaKey || e.ctrlKey) && e.key === 'Enter'` and the form is valid, call `form.handleSubmit(onRefine)()`. Do not `preventDefault` plain Enter.

## 3. `ResultView` component

- [ ] 3.1 Create `features/refine/components/ResultView.tsx`. Render a dashed-border placeholder card (`--surface` background) containing: a `Sparkles` icon in a muted rounded tile, heading `"Your refined prompt appears here"`, and body copy `"Paste a rough instruction above and hit Refine. You'll get a sharper, Claude Code-ready prompt plus a short 'what changed'."`.

## 4. Page and exports

- [ ] 4.1 Update `app/page.tsx` to import `PromptInput` and `ResultView` from `features/refine`. Render them in a single-column stack (`flex flex-col gap-6 max-w-[1240px] mx-auto px-6 py-8`). Pass `console.log` as the `onRefine` stub.
- [ ] 4.2 Update `features/refine/index.ts` to export `PromptInput` and `ResultView`.
- [ ] 4.3 Update `features/refine/OVERVIEW.md` to list `PromptInput` and `ResultView` under Components and record `app/page.tsx` as the page route.

## 5. Tests

- [ ] 5.1 Create `features/refine/components/PromptInput.test.tsx`. Use React Testing Library with `happy-dom`. Render `<PromptInput onRefine={vi.fn()} />` (or Bun's equivalent mock).
- [ ] 5.2 Assert counts show `"No input yet"` on initial render and update to `"<N> chars · <W> words"` after typing.
- [ ] 5.3 Assert Refine is disabled when the textarea is empty and enabled after typing a valid prompt.
- [ ] 5.4 Assert clicking "Use example" fills the textarea with the sample and enables Refine.
- [ ] 5.5 Assert clicking "Clear" empties the textarea, resets counts to `"No input yet"`, and disables Refine.
- [ ] 5.6 Assert "Clear" is disabled when the textarea is already empty.
- [ ] 5.7 Assert clicking Refine calls `onRefine` with `{ prompt: <trimmed value> }`.
- [ ] 5.8 Assert ⌘+Enter on the textarea calls `onRefine` with the validated payload when the input is valid.
- [ ] 5.9 Assert ⌘+Enter does not call `onRefine` when the textarea is empty.

## 6. Verify

- [ ] 6.1 Run `bun test` — all tests pass.
- [ ] 6.2 Run `bun check` — Biome-clean.
- [ ] 6.3 Run `bun dev` and manually verify: counts update while typing, "Use example" fills and enables Refine, "Clear" clears, ⌘+Enter logs to the console, ResultView empty state is visible below the input panel.
