# ADR-0001: Multitenancy schema-per-tenant

- **Status:** Accepted (backfill — decision already implemented)
- **Date:** 2026-07-25 (recorded retroactively)
- **Deciders:** NexoCRM Architecture

## Context

CRM SaaS with financial responsibility (DIAN invoices, payments). A cross-tenant data leak is a critical incident (R-07) with legal implications (Ley 1581 data protection). We need strong isolation without operating N separate databases in the MVP.

## Decision

Multitenancy via **schema-per-tenant** in a single PostgreSQL: each tenant has its schema (`tenant_xxx`) with the core tables. A `public` schema for platform data (tenants, global users, plans). The tenant is resolved by subdomain in a middleware and every query runs against the resolved schema.

## Consequences

**Positive:**

- Strong isolation by design; hard to accidentally leak data across tenants.
- Per-tenant backup/restore and export are simple (Ley 1581).
- Typed migrations via TypeORM over an identical replicated structure.

**Negative / trade-offs:**

- Migrations must run against ALL schemas (custom migration runner).
- At > 100 tenants schema management gets heavy (R-05). Evaluate RLS as an evolution.
- Cross-tenant queries (platform analytics) require cross-schema raw SQL.

## Alternatives considered

- **Row-Level Security (`tenant_id` column + RLS)** — less schema overhead, but one policy bug leaks everything; more risk for financial data. Kept as a future evolution.
- **Database per tenant** — maximum isolation but operationally unviable in MVP.
