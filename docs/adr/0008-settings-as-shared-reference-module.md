# ADR-0008: `settings` is a shared reference module that other modules may read synchronously

- **Status:** Accepted
- **Date:** 2026-09-14
- **Deciders:** NexoCRM Architecture

## Context

ADR-0004 forbids imports between feature modules: they collaborate through the
EventBus. `contacts`, `companies` and `deals` nevertheless import
`TenantConfigService` and `CustomFieldsValidator` from `settings` to read the tenant
taxonomy and the custom-field definitions before validating a write. Those imports
lived in `scripts/api-architecture-baseline.json` as grandfathered violations.

An event-driven alternative (each module keeping its own cached copy of the tenant
configuration, refreshed by `settings.updated` events) buys nothing here: the data is
read-only reference configuration, it is already cached in Redis by `settings`, and a
write that validates against a stale copy is a correctness bug, not an acceptable
eventual consistency.

## Decision

`settings` joins `audit-log`, `auth` and `tenants` in the cop's `CROSS_MODULE_ALLOWED`
list. Modules may **read** from `settings` services. They must never write tenant
configuration through them, and `settings` must never import a feature module.

## Consequences

- The cross-module baseline entries for `contacts`, `companies` and `deals` disappear;
  the baseline only shrinks from here.
- A future module that needs tenant configuration reads it the same way instead of
  duplicating the cache.
- If `settings` ever grows behaviour that mutates feature data, that behaviour moves
  out of `settings` or goes through the EventBus.
