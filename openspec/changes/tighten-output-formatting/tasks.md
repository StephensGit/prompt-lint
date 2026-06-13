## 1. Meta-prompt

- [x] 1.1 Add the plain-text output rule to "Shape of the refined prompt": no
  Markdown emphasis, no backticks/code fences, plain identifiers; keep the five
  `## ` headings, hyphen bullets, and `[TODO: confirm …]` markers as-is.
- [x] 1.2 Bump `META_PROMPT_VERSION` to `2026-06-13.1` and add a changelog note.

## 2. Verify

- [x] 2.1 `bun test` green (meta-prompt + full suite); `tsc` + Biome clean.
- [x] 2.2 Live: rename and badge inputs render with no `**`, `_`, or backtick
  characters; five headings still split.
- [x] 2.3 Live: vague input still returns honest `[TODO]`s, not invented detail.
