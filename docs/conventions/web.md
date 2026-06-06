# Web Conventions

How frontend code is written in this repo. The source of truth for "how do I do X here".

## Project structure

```
app/                      routes, layouts, server components (thin)
features/<name>/
  api/                    data access
    keys.ts               query key factories (when using TanStack Query)
    <resource>.ts         async fetchers (get*) + hooks (use*)
  components/             UI for this feature
  hooks/                  feature-specific hooks
  utils/                  feature-specific helpers
  store/                  feature context/state (optional)
  index.ts                public exports
  OVERVIEW.md             what this feature is (see docs/templates/feature-overview.md)
components/ui/            shadcn primitives (owned, editable)
lib/                      cross-cutting: providers, utils (cn), env
```

Route files in `app/` stay thin: they import from a feature and render it. Logic lives in the feature.

## Data fetching

- **Default to Server Components.** Fetch in an `async` server component or an `async` fetcher in `api/`.
- Reach for **TanStack Query** only when a screen is genuinely client-state-heavy (live updates, optimistic UI, heavy caching). Wrap such trees in `lib/providers.tsx`.
- Provide both variants when a resource is used in both worlds: `getExamples()` (async, server) and `useExamples()` (hook, client).
- Query key factories live in `api/keys.ts`:
  ```ts
  export const exampleKeys = {
    all: ['examples'] as const,
    lists: () => [...exampleKeys.all, 'list'] as const,
    detail: (id: string) => [...exampleKeys.all, 'detail', id] as const,
  };
  ```
- **Never call `fetch` directly inside a component.** Go through `api/`.

## Styling

- Tailwind utility classes. No CSS-in-JS, no CSS modules.
- Compose primitives from `components/ui/` (shadcn). They're your files — edit them rather than wrapping/overriding.
- Theme via the CSS variables shadcn sets up in `globals.css` (`bg-primary`, `text-muted-foreground`, …). Dark mode swaps token values on `.dark`.
- Merge conditional classes with `cn()` from `lib/utils.ts`.

## Forms

- React Hook Form for every form, with a Zod schema via `zodResolver`:
  ```ts
  const form = useForm<FormState>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  ```
- Use React Hook Form's `<Controller>` with shadcn's `<Field>` primitives from `components/ui/field.tsx`.
  No `<Form>` / `<FormField>` wrapper — this is Base UI's approach, not Radix:
  ```tsx
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <Controller
      name="email"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Email</FieldLabel>
          <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
          <FieldDescription>We'll never share your email.</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
  ```
- `data-invalid` on `<Field>` drives validation styling; `aria-invalid` on the input itself handles accessibility.

## State

- Server state: TanStack Query (when used). Form state: RHF. Local UI state: `useState`/`useReducer`.
- No Redux/Zustand by default. If a project needs a global store, record it as an ADR first.

## Naming

- Components: PascalCase (`ExampleList.tsx`)
- Hooks: camelCase, `use` prefix (`useExamples.ts`)
- Utils/fetchers: camelCase (`formatExample.ts`, `getExamples`)
- One component/hook concept per file.

## Code standards (Biome-enforced)

- 2-space indent; single quotes for strings, double quotes for JSX attributes
- Semicolons always; trailing commas everywhere; arrow parens always
- Descriptive names — `setting` not `s`, `moduleName` not `m`
- No chained ternaries — use `if`/`else if`, a lookup object, or early returns
- Import from sub-paths, not barrels, where it affects tree-shaking (e.g. `lodash/debounce`, not `lodash`)

## Copy

- UK English everywhere ("colour", "organise", "centre", "licence").