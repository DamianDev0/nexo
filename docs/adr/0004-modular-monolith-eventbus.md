# ADR-0004: Modular monolith with EventBus communication

- **Status:** Accepted (backfill)
- **Date:** 2026-07-25
- **Deciders:** NexoCRM Architecture

## Context

A CRM with many bounded contexts (contacts, deals, invoicing, payments, notifications). Microservices from day 1 would be unjustified operational overhead for the MVP. But modules must not couple directly or it becomes an unextractable spaghetti monolith.

## Decision

**Modular monolith** in NestJS: bounded contexts as modules in a single deploy. Feature modules **do not import each other**; communication is **EventBus only** (domain events). E.g. `deals` emits `deal.won` → `invoices` and `notifications` react as listeners, with no direct dependency.

## Consequences

**Positive:**

- Low coupling; a module can later be extracted into a service without rewriting its consumers.
- Simple deploy and debugging (single process).
- Events are natural audit points and trigger points for the automation engine (Phase 4).

**Negative / trade-offs:**

- Async event flow is harder to trace; demands correlation IDs and structured logging.
- Risk of "phantom" events with no consumer; document the event catalog.

## Alternatives considered

- **Direct import between modules** — simple but creates the coupling we want to avoid.
- **Microservices** — premature; infra overhead and network latency with no benefit at this scale.

## Notes

Domain-event catalog and outgoing webhooks in `docs/architecture.md §11` and the `webhooks` module.
