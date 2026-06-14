## 1. Navbar + theme toggle

- [x] 1.1 `components/ThemeToggle.tsx` (client): lucide `Sun`/`Moon` icon button; toggles the
  `dark` class on `<html>`; persists to `localStorage`.
- [x] 1.2 `components/Navbar.tsx`: left brand (tile + name + tagline), right `ThemeToggle`.
- [x] 1.3 `app/layout.tsx`: render `<Navbar />`; pre-paint no-flash theme script (default
  dark); drop the hard-coded `dark` class; `suppressHydrationWarning`.

## 2. Colour-coded What Changed headers

- [x] 2.1 `WhatChanged.tsx`: colour each change summary by cycling the hue tokens
  (blue/violet/amber). `[TODO: confirm intent vs. kind/linking data.]`

## 3. Verify

- [x] 3.1 Live: navbar + toggle render; theme script injected; page 200.
- [x] 3.2 `tsc` 0 · `bun test` 53 pass · build OK · Biome clean on changed/new files
  (field/label errors are the pre-existing shadcn baseline).
- [ ] 3.3 Manual: click the toggle → light/dark flips and persists across reload; coloured
  headers legible in both modes; navbar matches the screenshot.
