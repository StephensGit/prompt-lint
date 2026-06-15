export type Change = {
  summary: string;
  reason: string;
};

export type Example = {
  id: string;
  label: string;
  tag: string;
  input: string;
  output: {
    refinedPrompt: string;
    changes: Change[];
  };
};

export const EXAMPLES: Example[] = [
  {
    id: 'example-1',
    label: 'Example 1',
    tag: 'Feature',
    input:
      "In `features/results/ResultsTable.tsx`, add a status column that renders a coloured badge (green=pass, red=fail) using the existing Badge component. Don't change the data fetching.",
    output: {
      refinedPrompt: `## Goal
Add a Status column to the results table in features/results/ResultsTable.tsx. Each cell in the column renders a Badge component coloured green when row.status is "pass" and red when row.status is "fail". The change is complete when the column appears in the rendered table and the correct colour variant is applied for both status values.

## Scope
The only file to edit is features/results/ResultsTable.tsx. The existing Badge component (imported from wherever it is already used or exported in this project) must be reused as-is. No other files should be created or modified.

## Acceptance criteria
- A "Status" column header appears in the table alongside the existing columns.
- Each row renders a Badge in the Status cell.
- A row with status "pass" renders the Badge with the green colour variant.
- A row with status "fail" renders the Badge with the red colour variant.
- The column is visible and correctly positioned in the table without breaking the layout of existing columns.
- [TODO: confirm whether any existing tests for ResultsTable need to be updated, or whether new tests should be added for the Status column.]

## Constraints
- Use the existing Badge component; do not create a new one or install any new dependency.
- Follow the prop API that Badge already exposes for colour or variant — [TODO: confirm the exact prop name and accepted values for green and red on the Badge component, e.g. variant="success" / variant="error" or color="green" / color="red"].
- Do not modify the data-fetching logic, hooks, or API calls in or connected to ResultsTable.tsx.
- Match the code style, import ordering, and formatting conventions already present in ResultsTable.tsx.


## Guardrail
Do not refactor, reformat, or touch any code outside the direct changes needed to add the Status column. Leave all existing columns, props, types, and data-fetching behaviour exactly as they are.`,
      changes: [
        {
          summary: 'Added definition of done',
          reason:
            'The original request stated what to build but not what done looks like; making the outcome explicit gives Claude Code a clear target to verify against.',
        },
        {
          summary: 'Narrowed file scope explicitly',
          reason:
            'Naming the single file to edit and stating no other files should be modified prevents accidental edits to related components, tests, or data-fetching layers.',
        },
        {
          summary:
            'Added acceptance criteria for both status values and layout',
          reason:
            'Without these, the implementer could add a column that only handles one status value or breaks the existing column layout.',
        },
        {
          summary:
            'Added TODO markers for Badge prop API and test expectations',
          reason:
            'The exact prop names for colour variants on Badge and whether tests need updating are not stated in the original request; fabricating them would risk mismatched implementation, so honest TODOs are used instead.',
        },
      ],
    },
  },
  {
    id: 'example-2',
    label: 'Example 2',
    tag: 'Vague',
    input: 'make the app better',
    output: {
      refinedPrompt: `## Goal
[TODO: confirm what "better" means here — please describe the specific improvement you want, e.g. a bug fix, a new feature, a performance improvement, a UI change, or a refactor.]

## Scope
[TODO: confirm which files, directories, or parts of the app are in scope for this change.]

## Acceptance criteria
[TODO: confirm what observable conditions must hold for the change to be considered correct — e.g. specific behaviour, passing tests, visual outcome.]

## Constraints
[TODO: confirm any constraints — e.g. no new dependencies, follow existing patterns, specific framework or style rules to honour.]

## Guardrail
[TODO: confirm what is explicitly out of scope and must not be touched during this change.]`,
      changes: [
        {
          summary: 'Replaced vague goal with TODO markers',
          reason:
            "Make the app better gives no concrete outcome; fabricating a goal would misrepresent the user's intent, so honest TODO markers are placed wherever specific information is needed.",
        },
        {
          summary: 'Added TODO markers for all five required sections',
          reason:
            'None of the five required sections can be filled in without more information from the user, so each is marked as needing confirmation rather than invented.',
        },
      ],
    },
  },
  {
    id: 'example-3',
    label: 'Example 3',
    tag: 'Refactor',
    input: 'the dashboard component is 600 lines, break it up',
    output: {
      refinedPrompt: `## Goal
Refactor the dashboard component by splitting it into smaller, focused sub-components so that no single file exceeds a reasonable size and each piece has a clear, single responsibility. The finished state is a set of well-named component files that together reproduce the current dashboard behaviour exactly, with the original dashboard file acting as a thin composition root.

## Scope
[TODO: confirm the file path of the dashboard component, e.g. src/components/Dashboard.tsx or similar]
In scope:
- The dashboard component file itself
- Any new sub-component files created during the split
Out of scope:
- Any other components, pages, hooks, utilities, or styles not currently living inside the dashboard component file
- Changes to routing, data-fetching logic, or state management that lives outside the component

## Acceptance criteria
- The original dashboard file is reduced to a composition root that imports and arranges the new sub-components; it should contain no large blocks of JSX or business logic.
- Each new sub-component file has a single clear responsibility and is named to reflect it.
- The rendered output of the dashboard in the browser is pixel-identical to before the refactor (no visual or behavioural regressions).
- All existing tests for the dashboard continue to pass without modification; if there are no tests, the split does not break any imports or usages of the dashboard elsewhere in the codebase.
- No new prop drilling or indirection is introduced beyond what is necessary to pass data to the new sub-components.

## Constraints
- Follow the file and folder conventions already used in the project for component organisation [TODO: confirm the convention, e.g. co-located files, a components/ subdirectory, barrel index files, etc.]
- Do not introduce any new libraries or dependencies.
- Preserve all existing prop types, exported identifiers, and the public interface of the dashboard component so that call sites need no changes.
- Follow the project's existing lint, formatting, and naming rules.

## Guardrail
Do not touch or refactor any code outside the dashboard component file and the new sub-component files created as part of this task. Do not rename, move, or restructure unrelated components, hooks, or utilities. Keep the change strictly limited to splitting the one identified file.`,
      changes: [
        {
          summary: 'Added definition of done',
          reason:
            'The original request named a problem but not what the finished result should look like; specifying a thin composition root and single-responsibility sub-components gives a concrete target.',
        },
        {
          summary: 'Added explicit scope with TODO markers',
          reason:
            'The file path was not provided and the boundaries of the refactor were unstated; marking the path as a TODO and listing what is out of scope prevents unintended changes to routing, state management, or unrelated components.',
        },
        {
          summary: 'Added acceptance criteria',
          reason:
            'Without observable pass/fail conditions the implementer has no way to verify correctness; criteria covering visual parity, test survival, and preserved public interface make the outcome verifiable.',
        },
        {
          summary: 'Added constraints on conventions and dependencies',
          reason:
            'A refactor can silently break existing import patterns or introduce unnecessary indirection; constraining the work to existing conventions and no new dependencies keeps the change safe.',
        },
        {
          summary: 'Added guardrail',
          reason:
            'A large component refactor creates temptation to clean up surrounding code; the guardrail makes explicit that only the target file and its new sub-components may be touched.',
        },
      ],
    },
  },
  {
    id: 'example-4',
    label: 'Example 4',
    tag: 'Rename',
    input:
      "rename the user prop to account everywhere but don't touch the API response shape",
    output: {
      refinedPrompt: `## Goal
Rename the prop currently called user to account throughout the client-side codebase. Every component, hook, context, and call site that receives or forwards this prop must use the new name account. The change is complete when no client-side code refers to a prop named user in the contexts where it previously carried user identity data.

## Scope
[TODO: confirm which directories or layers count as "client-side" in this project — e.g. src/components, src/hooks, src/context, or similar.]
In scope:
- All component prop definitions and their usages at call sites
- Hook return values and their destructuring at call sites
- Context value shapes and their consumers
- Any TypeScript or PropTypes type definitions that name the prop user in this context
Out of scope:
- API response parsing, transformation, or serialisation code — the shape of data coming from or going to the server must not change
- Any variable, field, or identifier named user that does not represent this prop (e.g. a local variable inside a fetch callback, a database column reference)
- Test fixture data that mirrors the API response shape

## Acceptance criteria
- Every prop previously named user that carried user identity data is now named account at both the definition site and every call site.
- No TypeScript, lint, or build errors are introduced.
- [TODO: confirm whether the project has a test suite — if so, all existing tests must continue to pass without changing their assertions about API response shape]
- Grepping the client-side source for the old prop spelling (e.g. prop named user, destructured as user, or spread as user=) returns no matches in the in-scope directories.
- The API response shape and any code that reads raw API responses is unchanged.

## Constraints
- Follow the existing naming and file conventions of the project; do not introduce new abstractions or helpers.
- Do not add new dependencies.
- Keep the rename mechanical — do not refactor logic, restructure components, or change behaviour while making this change.

## Guardrail
Do not touch any code outside the rename. Do not refactor unrelated components, reorder imports, adjust formatting beyond what the rename requires, or alter any API-layer code. If a file contains both in-scope and out-of-scope uses of the word user, change only the in-scope prop references and leave everything else exactly as it is.`,
      changes: [
        {
          summary: 'Added TODO markers for missing scope details',
          reason:
            'The user did not specify which directories are considered client-side, so fabricating a path would risk misdirecting the rename; a TODO marker prompts confirmation instead.',
        },
        {
          summary:
            'Defined done as zero remaining in-scope prop references named user',
          reason:
            'The original instruction was imperative but lacked a measurable finish line; the grep-based criterion makes completeness verifiable.',
        },
        {
          summary: 'Clarified what out of scope means for the API boundary',
          reason:
            'The user said do not touch the API response shape, but that phrase is ambiguous about fixture data and raw-response parsing code; spelling this out prevents accidental over-reach or under-reach.',
        },
        {
          summary: 'Added guardrail against opportunistic refactoring',
          reason:
            'A mechanical rename touching many files creates temptation to clean up nearby code; the guardrail keeps the diff minimal and reviewable.',
        },
      ],
    },
  },
];
