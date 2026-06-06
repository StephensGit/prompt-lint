# ADR-0003: No GraphQL by default

## Status: accepted
## Date: 2026-06-01

## Context
The work stack uses GraphQL with `graphql-request` + codegen against a backend schema. New solo projects usually start with no backend, or a thin one (Next route handlers / server actions).

## Decision
Ship no GraphQL layer in the starter. Default to Server Components + `async` fetchers, with TanStack Query available for client-heavy cases. Add GraphQL per-project only when a project actually talks to a GraphQL API.

## Reasoning
- GraphQL codegen needs a schema/backend that greenfield projects don't have on day one.
- It's the heaviest piece to carry and the least often needed across quick ideas.

## Consequences
- A project that grows a GraphQL backend adds the client + codegen then, and records that as its own ADR.
