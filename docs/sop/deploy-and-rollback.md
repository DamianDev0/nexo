# SOP — Deploy and Rollback

**When:** promoting to staging/production and reverting on failure.

## Pre-deploy (gates)

No promotion without:

- [ ] CI green: lint, typecheck, unit, isolation e2e (see `.github/workflows/ci.yml`).
- [ ] Migrations tested with `migrate:dry` (see `tenant-migration.md`).
- [ ] Coverage above minimums (`docs/sop/testing.md`).

## Deploy

Orchestrated by `.github/workflows/deploy.yml`. Mandatory order:

1. Apply migrations (`pnpm --filter api migrate`) **before** starting the new API version.
2. Deploy API.
3. Deploy web.

## Post-deploy verification

- API healthcheck OK.
- Smoke test: login → dashboard loads.
- Metrics: p95 latency < 200ms, no DIAN/webhook error spikes.

## Rollback

1. Revert the app deploy to the previous version.
2. If there was an incompatible migration: `pnpm --filter api migrate:rollback` (careful with `invoices` — see ADR-0002).
3. Confirm tenant isolation remains intact after reverting.

## Golden rule

Migration and code must be **backward-compatible** during a deploy (expand/contract): first expand the schema, deploy code that uses the new shape, then contract in a later deploy. Never break-and-migrate in the same step.
