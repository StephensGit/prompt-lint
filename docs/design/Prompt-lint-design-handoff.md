# Handoff: Prompt Refiner

## Overview

**Prompt Refiner** is a single-screen developer tool. A user pastes a rough, freeform
coding instruction; the app rewrites it into a sharper prompt optimised for Claude Code
and shows a short "what changed and why" list. Single user, no auth, no dashboard — one
focused, fast-feeling screen.

This document is self-sufficient: you can implement the feature from this README alone.
The prototype files in this bundle are the visual + behavioural source of truth.

---

## About the design files

The files under `prototype/` and `source/` are **design references built in HTML/React**.
They are prototypes that demonstrate the intended look, layout, and behaviour — **not
production code to copy verbatim**. The prototype fakes the model call with a timed
character-stream; your job is to **recreate this UI in the real codebase** and wire it to
a real model endpoint.

- `prototype/Prompt Refiner.html` — the full clickable prototype (open in a browser). Use
  the **Tweaks** panel (bottom-right) to switch layout direction, theme, density, the
  "what changed" link style, accent, and to simulate error states.
- `prototype/Breakpoints.html` — the same build shown at 375 / 768 / 1024 / 1440 px.
- `source/` — the un-bundled source the prototype is assembled from. Read these for exact
  values and logic:
  - `styles.css` — all design tokens (shadcn-compatible) + every component style.
  - `app.jsx` — the state machine, streaming simulation, theming, layout directions.
  - `components.jsx` — Composer, RefinedPrompt (with streaming + change-linking),
    skeleton, ChangeList (3 variants), ErrorBox.
  - `icons.jsx` — inline icon set (replace with `lucide-react` — see Assets).
  - `data.js` — the sample content and the refined-prompt block model.

## Target stack (given)

- **Next.js** (App Router) + **React**
- **Tailwind CSS v4**
- **shadcn/ui**

Recreate the prototype using shadcn/ui primitives and Tailwind utilities. Do **not** port
the prototype's hand-written CSS class names; map them to shadcn components + Tailwind.
The prototype's `styles.css` is a token/spec reference, not code to ship.

## Fidelity

**High-fidelity.** Colours, typography, spacing, radii, interaction states, and copy are
final. Recreate pixel-faithfully using shadcn/ui + Tailwind. The one liberty: the
prototype's CSS is custom; you should express the same values through the shadcn/Tailwind
token system (below), not by copying CSS.

---

## Design tokens

These are intentionally **shadcn/ui defaults (zinc base)** so they drop straight into a
`shadcn init` project. Accent is the only addition — a restrained blue reserved for the
primary action. Values are HSL channel triples (the shadcn convention: store as
`H S% L%`, consume as `hsl(var(--x))`).

### `globals.css` — light (`:root`) and dark (`.dark`)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 221 83% 53%;          /* accent */
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;

  --primary: 221 83% 53%;       /* accent — blue */
  --primary-foreground: 0 0% 100%;

  /* surfaces used for placeholder / collapsed-original strips */
  --surface: 240 6% 98.4%;

  /* change-link hues (item ↔ prompt block) */
  --hue1: 221 83% 53%;   /* blue   — "Scope" */
  --hue2: 262 83% 58%;   /* violet — "Acceptance criteria" */
  --hue3: 28 90% 47%;    /* amber  — "Guardrail" */

  --radius: 0.625rem;    /* 10px */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 5.5%;
  --card-foreground: 0 0% 98%;
  --muted: 240 3.7% 14%;
  --muted-foreground: 240 5% 64.9%;
  --border: 240 3.7% 16%;
  --input: 240 3.7% 18%;
  --ring: 213 93% 64%;
  --secondary: 240 3.7% 14%;
  --secondary-foreground: 0 0% 98%;

  --primary: 213 93% 64%;
  --primary-foreground: 222 47% 11%;

  --surface: 240 9% 6.2%;

  --hue1: 213 93% 68%;
  --hue2: 258 92% 76%;
  --hue3: 38 96% 60%;
}
```

Also define a stronger border for the composer/inputs:
`--border-strong: 240 5.9% 83%` (light) / `240 4% 24%` (dark).

### Change-link tint alphas
Soft fill behind a linked prompt block / change marker: `hsl(var(--hueN) / 0.10)` light,
`/ 0.16` dark. Hover/active lift: `/ 0.18` light, `/ 0.26` dark.

### Typography
- **Sans (UI):** system stack — `ui-sans-serif, system-ui, -apple-system, "Segoe UI",
  Roboto, "Helvetica Neue", Arial, sans-serif`. (shadcn default; no web font needed.)
- **Mono (all prompt/code text — input textarea, refined prompt, collapsed original):**
  system mono — `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
  "Liberation Mono", monospace`.
- Scale (px): body 14; prompt/mono text **14.5 / line-height 1.72** (comfortable mode),
  **13.5 / 1.62** (compact); section eyebrow 11 uppercase `letter-spacing: 0.06em`;
  card title 13/600; change title 13.5/600; change reason 12.5; brand name 14.5/600.
- **Reading-length cap:** the refined prompt column is capped at **70ch** (72ch in the
  Focus direction) even when the panel is wider, to protect line length on desktop.

### Spacing / density (CSS var, two presets)
| Token | Comfortable | Compact |
|---|---|---|
| card padding | 22px | 16px |
| stack gap | 16px | 12px |
| control height | 44px | 38px |
| mono font-size | 14.5px | 13.5px |
| mono line-height | 1.72 | 1.62 |

Tap targets: primary controls 44px tall in comfortable mode (mobile floor). Icon buttons
36×36. Small buttons 32px.

### Radii / shadows
- `--radius: 10px`; buttons `radius - 2`, inner chips `radius - 4`.
- Shadows: sm `0 1px 2px hsl(240 6% 10% / .05)`; md `0 4px 14px -4px / .12`; pop for the
  Tweaks/popover `0 12px 34px -8px / .22`. Dark mode uses heavier black alphas (see
  `source/styles.css` `--shadow-*`).

---

## Layout & responsiveness

Mobile is the foundation; everything scales up from a single stacked column. Max content
widths cap the layout so nothing stretches on wide screens.

- **Mobile (base, < 720px):** single column, stacked — Composer on top, a thin vertical
  flow-connector (line · down-arrow · line), then Result, then "What changed". Layout
  `max-width: 720px`, centered. Generous tap targets.
- **Two-pane kicks in at ≥ 720px** (chosen just under 768 so tablets reliably get the
  two-pane view; the flow-connector hides here).
- **Wide screens:** content width caps per direction (see below); page gutters
  `clamp(16px, 4vw, 32px)`.

Show the layout working at **375 / 768 / 1024 / 1440** (see `prototype/Breakpoints.html`).

### Three desktop layout directions (ship the user's pick; prototype includes all 3)

1. **Twin** (default) — two equal columns. Input left (sticky, `top: 80px`), spanning two
   rows; Result top-right; "What changed" bottom-right. `max-width: 1240px`,
   `grid-template-columns: 1fr 1fr`, gap 22×24.
2. **Focus** — Composer full-width on top; Result in a wide reading column (left); "What
   changed" as a sticky right **inspector rail** (`312px`, widening to `340px` ≥ 1180px).
   `max-width: 1180px`, `grid-template-columns: minmax(0,1fr) 340px`. Prompt cap 72ch.
3. **Diff** — centered single stack, `max-width: 860px`, before→after framed with numbered
   spine nodes ("A" original → "B" refined) and the flow-connector retained. Best for
   reading the transformation top-to-bottom.

> Recommendation: ship **Twin** as the default desktop layout (before/after visible
> together, matches the brief), and keep Focus/Diff as internal options if useful. Confirm
> with the designer which one is canonical before deleting the others.

---

## Screens / states

There is one route. It is a state machine with five states:
`empty → loading → streaming → result`, plus `error` reachable from `loading`.

### State: `empty` (initial)
- **Composer** is the hero: a card with a 6-row monospace `<textarea>`, placeholder
  *"Paste your rough prompt…  e.g. "the status dropdown keeps its value when you switch
  tabs, it should reset. fix it""*. Border uses `--border-strong`; on focus-within, border
  goes `primary / 0.7` + a 3px `ring / 0.16` halo.
- **Composer footer** (top-bordered): left = meta — char/word count (`"123 chars · 24
  words"`, or `"No input yet"`), and a ghost **"Use example"** button (wand icon) when
  empty, or a ghost **"Clear"** (X icon) when there's text and not loading. Right = a
  `⌘↵` kbd hint chip + the primary **Refine** button (sparkles icon).
- **Result area** shows a dashed-border placeholder card on `--surface`: sparkles icon in
  a rounded muted tile, heading *"Your refined prompt appears here"*, body *"Paste a rough
  instruction on the left/top and hit Refine. You'll get a sharper, Claude Code-ready
  prompt plus a short 'what changed'."* ("left" in Twin, "top" otherwise.)
- **"What changed"** is not rendered until `result`.

### State: `loading` (analysing, pre-stream)
- Refine button is **disabled**, shows a spinner + label **"Analysing…"**, and a diagonal
  **shimmer sweep** overlay (1.15s loop) signals progress.
- Result card appears with header **"Refined prompt"** (+ disabled Copy button) and a
  **skeleton**: 6 shimmer lines of varied widths (40/92/78/30/88/64%).
- Prototype timing: ~720ms in `loading` before streaming. Replace with the real request's
  pending phase.

### State: `streaming`
- Refine button label switches to **"Refining…"** (spinner + shimmer continue).
- Skeleton is replaced by the refined prompt **typing in block-by-block**, with a blinking
  **caret** (`8px × 1.05em`, accent colour, 1s blink) at the live end of the most recent
  visible block.
- Copy stays disabled until `result`.
- Prototype simulates this by revealing N characters across the serialized blocks on a
  ~22ms tick (~110 ticks, ≈2.7s). **In production, drive this from the real token stream**
  — reveal text as chunks arrive; keep the caret on the trailing block.

### State: `result`
- Refined prompt fully rendered in a readable panel (mono, 14.5/1.72, capped at 70ch).
- The prompt is structured as **labelled blocks** (see Data model). Three of the blocks
  are **linked** to a "what changed" item: they get a soft hue tint background + a 3px
  left accent bar in the hue, and an uppercase hue-coloured label.
- **Copy button** (outline, copy icon) top-right of the card. On click it copies the full
  serialized prompt and swaps to a green **"Copied!"** confirmation (check icon) for ~2s.
- **Card footer:** a small accent dot + **"Refined with Claude Sonnet 4.6"** (subtle, 12px
  muted — not a prominent badge).
- **"What changed & why"** card renders below/aside: header with wand icon + a count
  badge (`3`), then the change list (see variants). Hovering a change **lights up** its
  matching prompt block and vice-versa (shared `lit` state keyed by change id).

### State: `error`
- Replaces the result card with an inline **ErrorBox**: red-tinted bordered panel, alert
  icon, a title + one-line friendly body + an outline **retry** button. Three variants:
  - `empty` → *"Add a prompt to refine"* / body about the empty composer / CTA **"Use an
    example"** (retry refills the example and focuses the textarea).
  - `model` → *"The model hit an error"* / *"…usually transient — give it another go."* /
    **"Try again"**.
  - `timeout` → *"Request timed out"* / *"That took longer than 30s and was cancelled.
    Your input is still here — retry when ready."* / **"Retry"**.
- Empty-input error is also pre-empted client-side (Refine with blank input → `error:empty`
  immediately). Typing into the box clears the empty error back to `empty`.

---

## "What changed" → prompt relationship (explore, then pick one)

The visible link between each change and where it applies is implemented **three ways**
(Tweaks → "Link style"). Pick one for production; **Colour** is the recommended default.

1. **Colour** (`linked`) — each change is a card with a hue accent (check-mark marker);
   its matching prompt block carries the same hue tint + left bar. Cross-hover highlights
   both. Strongest spatial link.
2. **Numbered** (`numbered`) — change cards show a number (1/2/3); the matching prompt
   block's label is prefixed with the same number chip. Good when colour is overloaded.
3. **Grouped** (`grouped`) — flat list grouped by kind (Added / Guardrail) with a small
   hue square per item; lighter weight, less spatial.

Each change has: `id`, `hue` (1–3), `kind` ("Added" | "Guardrail"), `title`, `reason`.
Reason tone: short, plain, dev-to-dev, one line, explains the *why* not the *what*.

---

## Interactions & behaviour

- **Refine trigger:** click the button, or **⌘/Ctrl + Enter** in the textarea.
- **Streaming:** see `streaming` state. Caret tracks the trailing visible block.
- **Copy:** `navigator.clipboard.writeText(serialized)`; optimistic "Copied!" for 2s;
  fall back to the same UI if the API is unavailable.
- **Clear / Use example:** reset composer + focus textarea.
- **Change ↔ prompt hover linking:** a single `lit` value (change id | null) shared between
  the prompt blocks and the change list drives the highlight on both sides.
- **Theme toggle:** sun/moon icon-button in the top bar flips light/dark by setting
  `data-theme` (prototype) → use `class="dark"` on `<html>` in the shadcn convention.
  Default **dark**. (Prototype defaults dark; the brief also allows "match system" — wire
  to `prefers-color-scheme` if desired.)
- **Animations:** result/error cards fade-up on enter (`opacity 0→1`, `translateY 8px→0`,
  ~0.34s, `cubic-bezier(.22,.61,.36,1)`); all gated behind
  `@media (prefers-reduced-motion: no-preference)`. Caret blink 1s; button shimmer 1.15s.
- **Responsive:** as per Layout section. Sticky offsets assume an ~64px top bar (prototype
  uses `top: 80px`).

## State management

Local component state is sufficient (no global store needed):
- `input: string`
- `status: 'empty' | 'loading' | 'streaming' | 'result' | 'error'`
- `errorKind: 'empty' | 'model' | 'timeout' | null`
- `revealed: number` (chars revealed during stream; in production, derive from the real
  stream instead of a char counter)
- `lit: string | null` (hovered change id, for cross-highlighting)
- `copied: boolean`

Transitions: `empty/blank + Refine → error:empty`; `empty + Refine → loading → streaming
→ result`; any `loading/streaming` error → `error:{model|timeout}`; `retry` → back to
`loading`. See `source/app.jsx` (`refine`, `startStream`, `retry`, `copy`) for the exact
logic — port the structure, swap the timers for the real request/stream.

## Data fetching (to implement — prototype fakes it)

- **Endpoint:** add a server route (e.g. Next.js Route Handler `app/api/refine/route.ts`)
  that takes `{ prompt: string }` and **streams** the refined prompt back (Claude Sonnet
  with streaming). Render tokens into the prompt panel as they arrive.
- **Refined-prompt structure:** the UI expects labelled blocks (Goal / Scope / Acceptance
  criteria / Constraints / Guardrail) plus a list of changes. Either (a) have the model
  return structured JSON `{ blocks: [...], changes: [...] }`, or (b) return the prompt as
  text and parse labels client-side — option (a) is cleaner and keeps the change↔block
  linking reliable (each linked block carries a `changeId`).
- **Timeout:** ~30s, then surface `error:timeout` (keep the user's input).
- **Errors:** any model/network failure → `error:model`.
- Never block the UI; the composer should remain readable while streaming.

## Sample content (use verbatim for tests / Storybook)

See `source/data.js`. Summary:
- **Rough input:** *"the status dropdown on the results table keeps its value when you
  switch tabs, it should reset to default. fix it"*
- **Refined blocks:** Goal / Scope* / Acceptance criteria* / Constraints / Guardrail*
  (\* = linked to a change). Full text in `data.js`.
- **Changes (3):**
  1. (blue, Added) "Added explicit file scope" — *Keeps Claude Code inside
     features/results/ instead of drifting into the data layer.*
  2. (violet, Added) "Added acceptance criteria + a test" — *Gives a clear definition of
     done so it doesn't stop halfway.*
  3. (amber, Guardrail) 'Added a "do not touch" guardrail' — *Prevents unrelated refactors
     creeping into the diff.*
- **Model label shown:** "Claude Sonnet 4.6".

## Assets

- **Icons:** the prototype hand-rolls a small SVG set (`source/icons.jsx`) in a
  Lucide-compatible style (24×24, `currentColor`, stroke-width 2). **Use `lucide-react`**
  in production. Mapping: sparkles→`Sparkles`, copy→`Copy`, check→`Check`,
  alert→`AlertTriangle`, x→`X`, retry→`RotateCw`, arrow-down→`ArrowDown`,
  arrow-right→`ArrowRight`, sun→`Sun`, moon→`Moon`, wand→`Wand2` (or `Sparkles`),
  chevron→`ChevronDown`, corner-down→`CornerDownLeft`.
- **Fonts:** none to bundle — system sans + system mono.
- **Images:** none.
- **Brand mark:** the top-bar logo is a sparkles glyph on an accent gradient tile —
  placeholder. Swap for the real product mark if/when one exists.

## Files in this bundle

- `prototype/Prompt Refiner.html` — full clickable prototype (with Tweaks panel).
- `prototype/Breakpoints.html` — 375 / 768 / 1024 / 1440 showcase.
- `source/styles.css` — token + component spec (read for exact values).
- `source/app.jsx` — state machine, streaming sim, theming, layout directions.
- `source/components.jsx` — Composer, RefinedPrompt, skeleton, ChangeList (3 variants),
  ErrorBox.
- `source/icons.jsx` — icon reference (replace with lucide-react).
- `source/data.js` — sample content + refined-prompt block model.

## Implementation checklist

- [ ] `shadcn init` (zinc base) + Tailwind v4; paste the token block into `globals.css`,
      add `--hue1/2/3`, `--border-strong`, `--surface`, `--primary` (blue), default dark.
- [ ] Build the Composer from shadcn `Textarea` + `Button`; mono font on the textarea;
      focus ring + footer meta; ⌘↵ submit.
- [ ] Result panel: shadcn `Card`; labelled blocks with hue-linked styling; 70ch cap;
      Copy with "Copied!" confirmation; subtle model footer.
- [ ] "What changed" list — implement the chosen variant (default: Colour) with
      hover-linking to prompt blocks.
- [ ] States: empty / loading (skeleton + button progress) / streaming (caret) / result /
      error (3 kinds) with retry.
- [ ] Server route streaming Claude Sonnet; 30s timeout; structured blocks+changes.
- [ ] Responsive: mobile single-column foundation; two-pane ≥ 720px; pick a desktop
      direction (default Twin); cap widths.
- [ ] Reduced-motion guards on all animations; light + dark verified.
