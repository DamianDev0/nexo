# ADR-0003: Frontend with Feature-Sliced Design + Atomic Design

- **Status:** Accepted (backfill)
- **Date:** 2026-07-25
- **Deciders:** NexoCRM Architecture

## Context

The frontend (Next.js App Router) will grow to dozens of features (contacts, deals, invoicing, inbox, automation). Without explicit layered architecture, business logic leaks into components and dependencies become a tangled graph that is hard to test.

## Decision

**Feature-Sliced Design** as the layering: `app → views → widgets → features → entities → shared`. Imports flow only downward (a layer never imports from a higher one). Inside `shared/ui`, **Atomic Design** (atoms → molecules → organisms). shadcn/ui as vendor primitives. The frontend domain mirrors the backend domain (DDD).

## Consequences

**Positive:**

- Predictable location for every piece; faster dev onboarding.
- Layer-by-layer testing; isolated features.
- Scales to many features without circular coupling.

**Negative / trade-offs:**

- FSD learning curve; requires discipline on import rules (enforce with ESLint).
- Can feel over-structured for trivial features.

## Alternatives considered

- **By-type structure (components/ hooks/ pages/)** — collapses at scale; feature co-location wins.
- **Atomic Design only** — organizes UI but not business logic or data flow.

## Notes

Reference skill: `fsd-nextjs-frontend`. Detail in `docs/frontend-architecture.md` and `docs/frontend-standards.md`. Enforced by `pnpm --filter web check:arch` (file-size, colors, html-primitives).
