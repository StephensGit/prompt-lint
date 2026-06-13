## ADDED Requirements

### Requirement: Live character and word counts update as the user types

The `PromptInput` component SHALL display the current character count and word count of the textarea value, updating on every keystroke. When the textarea is empty, the component SHALL display "No input yet" in place of the counts.

#### Scenario: Counts update while typing

- **WHEN** the user types into the textarea
- **THEN** the character count reflects the exact length of the current value and the word count reflects the number of whitespace-separated words

#### Scenario: Counts show placeholder when empty

- **WHEN** the textarea is empty
- **THEN** the component displays "No input yet" instead of a numeric count

### Requirement: Refine button is disabled when input is empty or invalid

The `PromptInput` component SHALL disable the Refine button whenever the textarea value fails `RefineRequestSchema` validation (empty, whitespace-only, or over `MAX_PROMPT_LENGTH` characters). The button SHALL be enabled when the value is valid.

#### Scenario: Refine disabled on empty input

- **WHEN** the textarea is empty
- **THEN** the Refine button is disabled

#### Scenario: Refine enabled on valid input

- **WHEN** the textarea contains at least one non-whitespace character within the length limit
- **THEN** the Refine button is enabled

### Requirement: ⌘+Enter triggers the Refine handler when the textarea is focused

The `PromptInput` component SHALL call the `onRefine` handler with the validated payload when the user presses ⌘+Enter (or Ctrl+Enter) while the textarea is focused, provided the current value is valid.

#### Scenario: ⌘+Enter submits a valid prompt

- **GIVEN** the textarea contains a valid prompt and is focused
- **WHEN** the user presses ⌘+Enter
- **THEN** `onRefine` is called with the validated `{ prompt }` payload

#### Scenario: ⌘+Enter does nothing when input is invalid

- **GIVEN** the textarea is empty and focused
- **WHEN** the user presses ⌘+Enter
- **THEN** `onRefine` is not called

### Requirement: "Use example" fills the textarea with the sample prompt

The `PromptInput` component SHALL provide a "Use example" button that, when clicked, sets the textarea value to the sample prompt: *"the status dropdown on the results table keeps its value when you switch tabs, it should reset to default. fix it"*. After filling, the counts SHALL update and the Refine button SHALL become enabled.

#### Scenario: "Use example" populates the textarea

- **WHEN** the user clicks "Use example"
- **THEN** the textarea value equals the sample prompt, the counts reflect that value, and the Refine button is enabled

### Requirement: "Clear" empties the textarea and is disabled when the textarea is already empty

The `PromptInput` component SHALL provide a "Clear" button that empties the textarea. The button SHALL be disabled when the textarea value is already empty (including after clearing). After clearing, the counts SHALL return to the "No input yet" state and the Refine button SHALL be disabled.

#### Scenario: "Clear" empties the textarea

- **GIVEN** the textarea contains text
- **WHEN** the user clicks "Clear"
- **THEN** the textarea value is empty, counts show "No input yet", and the Refine button is disabled

#### Scenario: "Clear" is disabled when the textarea is empty

- **WHEN** the textarea is empty
- **THEN** the Clear button is disabled

### Requirement: Refine button calls `onRefine` with the validated payload

When the user submits via the Refine button (or ⌘+Enter), the `PromptInput` component SHALL call the `onRefine` prop with the value validated and trimmed by `RefineRequestSchema`. No network call is made by the component itself.

#### Scenario: Submit calls `onRefine` with validated data

- **GIVEN** the textarea contains a valid prompt
- **WHEN** the user clicks Refine
- **THEN** `onRefine` is called once with `{ prompt: <trimmed value> }` and no fetch is made

### Requirement: `ResultView` renders the empty-state placeholder

The `ResultView` component SHALL render a placeholder card matching the design: a Sparkles icon in a muted rounded tile, heading "Your refined prompt appears here", and body copy "Paste a rough instruction above and hit Refine. You'll get a sharper, Claude Code-ready prompt plus a short 'what changed'.".

#### Scenario: Empty state is rendered

- **WHEN** `ResultView` is rendered with no props
- **THEN** the heading "Your refined prompt appears here" is visible and the body copy is present
