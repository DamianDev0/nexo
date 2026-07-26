# SOP — Multi-tenant Migration

**When:** any schema change. With schema-per-tenant, a migration must run against `public` and against ALL tenant schemas.

## Context

Real stack: **TypeORM** (`src/data-source.ts`). Custom runner: `scripts/migrate-all-tenants.ts`.

## Flow

1. Generate the migration from entity changes:
   ```bash
   pnpm --filter api migration:generate
   ```
2. Review the generated SQL by hand. **Never** trust blind generation on financial data.
3. Dry-run across all tenants (does not apply, reports only):
   ```bash
   pnpm --filter api migrate:dry
   ```
4. Apply to all tenants:
   ```bash
   pnpm --filter api migrate
   ```

## Verification

- The runner must report N schemas migrated with no error.
- Isolation test still green after migrating.

## Rollback

```bash
pnpm --filter api migrate:rollback
```

- Approved DIAN invoices are **never** deleted or destructively reverted (see ADR-0002 / PRD §7). A rollback touching `invoices` requires manual review.

## Risks (R-05)

At > 100 tenants sequential migration gets slow. Monitor duration; consider batching or a maintenance window. Never run at peak hours without a prior dry-run.
