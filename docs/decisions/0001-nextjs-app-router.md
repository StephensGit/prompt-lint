# ADR-0001: Next.js (App Router) as the base

## Status: accepted
## Date: 2026-06-01

## Context
This is the starter for solo greenfield web projects. It needs to cover both static/marketing and app-like work, deploy trivially, and pair well with AI coding tools and the public React/Next agent skills.

## Decision
Use Next.js with the App Router and React Server Components as the default base, deployed on Vercel.

## Reasoning
- Server Components + server actions cover most data needs without a separate client data layer.
- The strongest public agent skills (`vercel-react-best-practices`, `next-best-practices`) are Next-shaped, so they apply directly.
- One framework spans static pages and full apps — fewer per-project decisions.

## Consequences
- Server Components don't unit-test cleanly; integration coverage goes through Playwright.
- Diverges from the work stack (RSBuild SPA), so muscle memory transfers at the pattern level, not the API level.
