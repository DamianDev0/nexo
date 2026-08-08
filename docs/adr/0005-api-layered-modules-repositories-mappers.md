# ADR-0005: Layered module internals — repositories, mappers, thin services

- **Status:** Accepted
- **Date:** 2026-08-07
- **Deciders:** NexoCRM Architecture

## Context

ADR-0004 fixed the macro shape (modular monolith, EventBus between modules) but said nothing about the inside of a module. In practice every module converged on a single service class doing four jobs at once: raw SQL against the tenant schema, row→DTO mapping, business rules, and orchestration. By mid E0X the symptoms were measurable:

- `deals.service.ts` reached 717 lines with ~20 inline SQL statements; `products.service.ts` 702; `companies.service.ts` 436.
- Row→DTO mapping lived as private methods inside services, untestable without booting the DI container and mocking the database.
- SQL was scattered across 30 files, making tenant-isolation auditing (our most critical invariant, ADR-0001) a full-codebase grep instead of a review of one folder per module.
- Nothing stopped the next feature from making it worse: no lint rule, no CI gate, no convention doc.

Constraints: zero functional change was mandatory (the refactor shipped mid-development on a working test suite of 475 tests), and the cost per new feature had to stay low — this is a CRM with dozens of similar CRUD-plus-rules use cases.

## Decision

Every API module follows a fixed internal layout and dependency direction:

```
modules/<name>/
├── <name>.module.ts      wiring only; path never changes (app.module imports it)
├── controllers/          HTTP: DTO in → service → DTO out; zero logic
├── services/             orchestration + business rules + events; ZERO SQL; soft cap 400 lines, split by use case
├── repositories/         ALL SQL; @Injectable wrapping TenantDbService; returns Row types; never imports DTOs
├── mappers/              pure functions Row → DTO; no DI, no typeorm, no DB
├── dto/                  class-validator inputs, response types
├── interfaces/           Row types and internal contracts
├── constants/            SQL fragments, enums
├── events/ · listeners/  EventBus contracts in and out
```

Dependency direction is one-way: `controllers → services → repositories`, with `mappers` called only at the service edge. Transactional boundaries live in the repository: one `TenantDbService.query(schema, cb)` callback per unit of work, exactly as before the refactor.

The layout is **enforced at commit time**: `scripts/check-api-architecture.mjs` runs via husky/lint-staged and blocks any commit that puts SQL outside `repositories|queries|constants|entities|migrations`, makes a mapper impure, lets a repository import DTOs, lets a controller import a repository, or adds a new cross-module import. Legacy violations are grandfathered in `scripts/api-architecture-baseline.json`, which only shrinks.

## Consequences

**Positive:**

- Tenant isolation is auditable per module: all SQL for a context sits in one folder.
- Mappers are pure and unit-testable with zero mocks; services test business rules against a mocked repository interface instead of a mocked QueryRunner.
- Services stay small and readable; new use cases get their own service instead of growing a god class.
- The convention is self-enforcing — violations fail the commit, not the code review.
- Swapping data access (e.g. query optimization, read replicas) touches repositories only.

**Negative / trade-offs:**

- More files per feature (~3–4 extra: repository, mapper, row interfaces). For a trivial CRUD endpoint this is ceremony.
- Repository methods that wrap multi-statement transactions occasionally carry a `NotFoundException` mid-flow to preserve exact legacy behavior — a small leak of HTTP semantics into the data layer, accepted to guarantee zero behavior change.
- The commit-time checker is regex-based, not AST-based: it can be fooled deliberately. It targets drift, not adversaries.

**Neutral / notes:**

- Cross-module imports of `audit-log`, `auth` and `tenants` remain allowed as infra exceptions; they are candidates to move under `shared/`. Converting the remaining grandfathered cross-module imports to EventBus events is deliberate future work — mixing it into this refactor would have broken the zero-functional-change guarantee.
- `queries/` is reserved for read-only projection queries (CQRS-lite) where a heavy report doesn't fit the repository's aggregate shape; use only when it earns its keep.

## Alternatives considered

- **Status quo (fat services)** — rejected: growth was unbounded and the tenant-isolation audit surface kept widening.
- **Full Clean/Hexagonal architecture (ports, adapters, use-case classes per operation)** — rejected: doubles the file count again and adds indirection this CRUD-heavy domain doesn't pay back; the modular monolith boundary (ADR-0004) already gives us extractability.
- **TypeORM repositories/entities everywhere instead of raw SQL repositories** — rejected: schema-per-tenant raw SQL through `TenantDbService` is already the proven pattern (and TypeORM's RETURNING quirks burned us — see tags fix); wrapping it in a thin repository layer keeps the pattern while containing it.
- **Convention by documentation only** — rejected: the convention already existed informally and lost to deadline pressure every time; without a commit gate it regresses.
