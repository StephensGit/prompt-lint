# Example Feature

> Reference feature showing the folder pattern. Delete it when you start a real project.

## Purpose
Demonstrates how a feature is structured: `api` / `components` / `hooks` / public exports.

## Routes
- none — import `ExampleList` into a route in `app/` to see it render.

## Structure
- `api/` — `keys.ts` (query key factory), `examples.ts` (`getExamples` async + `useExamples` hook)
- `components/` — `ExampleList` (client component)
- `hooks/` — `useExampleFilter`

## Data
`getExamples` returns mock data; replace it with a route handler, server action, or external API. `useExamples` wraps it in TanStack Query for client use.

## Current state / known issues
- Mock data only — it exists to model the structure.
