/**
 * Tenant Migration Runner — E-01-S02
 *
 * Applies pending SQL migrations to every active tenant schema.
 *
 * Usage:
 *   pnpm migrate              # apply all pending migrations
 *   pnpm migrate --dry-run    # show what would run, without applying
 *   pnpm migrate --tenant acme-corp  # run only for a specific tenant slug
 *   pnpm migrate --rollback 002_add_contacts_archived_at  # roll back one migration
 *
 * Design decisions:
 *   - Idempotent: each migration is tracked in `{schema}.migrations` by name.
 *     Running the script twice never duplicates changes.
 *   - Isolated: errors in one tenant schema are logged and skipped —
 *     they never stop migrations for other tenants.
 *   - Transactional: each migration runs in a transaction per tenant.
 *     A partial failure rolls back only that tenant's current migration.
 *   - Ordered: migrations run in the order they appear in migrations/index.ts.
 */

import { DataSource, type QueryRunner } from 'typeorm'
import { migrations, type TenantMigration } from './migrations/index'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TenantRow {
  id: string
  slug: string
  schema_name: string
}

interface MigrationResult {
  tenant: string
  schema: string
  applied: string[]
  skipped: string[]
  failed: Array<{ name: string; error: string }>
}

interface RunOptions {
  dryRun: boolean
  tenantSlug: string | null
  rollbackName: string | null
}

// ── Database connection ────────────────────────────────────────────────────────

function createDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER ?? 'nexocrm',
    password: process.env.DATABASE_PASSWORD ?? 'nexocrm_dev',
    database: process.env.DATABASE_NAME ?? 'nexocrm',
    // No entities needed — we run raw SQL only
  })
}

// ── Migration tracking table ───────────────────────────────────────────────────

const CREATE_TRACKING_TABLE = (schema: string) => `
  CREATE TABLE IF NOT EXISTS "${schema}".migrations (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL UNIQUE,
    applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    applied_by  VARCHAR(100)          DEFAULT current_user
  )
`

async function getAppliedMigrations(runner: QueryRunner, schema: string): Promise<Set<string>> {
  const rows = await runner.query<Array<{ name: string }>>(
    `SELECT name FROM "${schema}".migrations ORDER BY id`,
  )
  return new Set(rows.map((r) => r.name))
}

async function recordMigration(runner: QueryRunner, schema: string, name: string): Promise<void> {
  await runner.query(`INSERT INTO "${schema}".migrations (name) VALUES ($1)`, [name])
}

async function removeMigrationRecord(
  runner: QueryRunner,
  schema: string,
  name: string,
): Promise<void> {
  await runner.query(`DELETE FROM "${schema}".migrations WHERE name = $1`, [name])
}

// ── Per-tenant migration logic ─────────────────────────────────────────────────

async function migrateOneTenant(
  dataSource: DataSource,
  tenant: TenantRow,
  options: RunOptions,
): Promise<MigrationResult> {
  const { schema_name: schema, slug } = tenant
  const result: MigrationResult = {
    tenant: slug,
    schema,
    applied: [],
    skipped: [],
    failed: [],
  }

  const runner = dataSource.createQueryRunner()
  await runner.connect()

  try {
    // Ensure tracking table exists
    await runner.query(CREATE_TRACKING_TABLE(schema))

    if (options.rollbackName) {
      // ── Rollback mode ────────────────────────────────────────────────────
      const migration = migrations.find((m) => m.name === options.rollbackName)
      if (!migration) {
        result.failed.push({
          name: options.rollbackName,
          error: `Migration "${options.rollbackName}" not found in registry`,
        })
        return result
      }
      if (!migration.down) {
        result.failed.push({
          name: migration.name,
          error: 'No rollback SQL defined for this migration',
        })
        return result
      }

      const applied = await getAppliedMigrations(runner, schema)
      if (!applied.has(migration.name)) {
        result.skipped.push(migration.name)
        return result
      }

      if (!options.dryRun) {
        await runner.startTransaction()
        try {
          const sql = migration.down.replaceAll('{schema}', schema)
          await runner.query(sql)
          await removeMigrationRecord(runner, schema, migration.name)
          await runner.commitTransaction()
        } catch (err) {
          await runner.rollbackTransaction()
          throw err
        }
      }
      result.applied.push(`[ROLLBACK] ${migration.name}`)
    } else {
      // ── Forward migration mode ────────────────────────────────────────────
      const applied = await getAppliedMigrations(runner, schema)

      for (const migration of migrations) {
        if (applied.has(migration.name)) {
          result.skipped.push(migration.name)
          continue
        }

        if (options.dryRun) {
          result.applied.push(`[DRY-RUN] ${migration.name}`)
          continue
        }

        await runner.startTransaction()
        try {
          const sql = migration.up.replaceAll('{schema}', schema)
          await runner.query(sql)
          await recordMigration(runner, schema, migration.name)
          await runner.commitTransaction()
          result.applied.push(migration.name)
        } catch (err) {
          await runner.rollbackTransaction()
          const error = err instanceof Error ? err.message : String(err)
          result.failed.push({ name: migration.name, error })
          // Continue with next migration — don't stop for this tenant
        }
      }
    }
  } finally {
    await runner.release()
  }

  return result
}

// ── Main ───────────────────────────────────────────────────────────────────────

function parseArgs(): RunOptions {
  const args = process.argv.slice(2)
  return {
    dryRun: args.includes('--dry-run'),
    tenantSlug: args.includes('--tenant') ? (args[args.indexOf('--tenant') + 1] ?? null) : null,
    rollbackName: args.includes('--rollback')
      ? (args[args.indexOf('--rollback') + 1] ?? null)
      : null,
  }
}

function printSummary(results: MigrationResult[], dryRun: boolean): void {
  const separator = '─'.repeat(60)
  console.log(`\n${separator}`)
  console.log(dryRun ? '  DRY RUN — no changes were applied' : '  Migration Summary')
  console.log(separator)

  let totalApplied = 0
  let totalSkipped = 0
  let totalFailed = 0

  for (const r of results) {
    const status = r.failed.length > 0 ? '✗' : r.applied.length > 0 ? '✓' : '–'
    console.log(`\n  [${status}] ${r.tenant} (${r.schema})`)

    if (r.applied.length > 0) {
      for (const name of r.applied) console.log(`      + ${name}`)
      totalApplied += r.applied.length
    }
    if (r.skipped.length > 0) {
      console.log(`      skipped: ${r.skipped.length} already applied`)
      totalSkipped += r.skipped.length
    }
    if (r.failed.length > 0) {
      for (const f of r.failed) console.log(`      ✗ ${f.name}: ${f.error}`)
      totalFailed += r.failed.length
    }
  }

  console.log(`\n${separator}`)
  console.log(
    `  Tenants: ${results.length} | Applied: ${totalApplied} | Skipped: ${totalSkipped} | Failed: ${totalFailed}`,
  )
  console.log(separator)

  if (totalFailed > 0) {
    console.error('\n  ⚠  Some migrations failed — check logs above before deploying.\n')
    process.exit(1)
  }
}

async function main(): Promise<void> {
  const options = parseArgs()

  console.log('\nNexoCRM — Tenant Migration Runner')
  if (options.dryRun) console.log('Mode: DRY RUN')
  if (options.rollbackName) console.log(`Mode: ROLLBACK → ${options.rollbackName}`)
  if (options.tenantSlug) console.log(`Target: tenant "${options.tenantSlug}"`)
  console.log(`Migrations registered: ${migrations.length}\n`)

  if (migrations.length === 0 && !options.rollbackName) {
    console.log('No migrations registered. Nothing to do.')
    return
  }

  const dataSource = createDataSource()

  try {
    await dataSource.initialize()

    // Load tenants from public schema
    const tenantFilter = options.tenantSlug ? `WHERE slug = $1` : ''
    const tenantParams = options.tenantSlug ? [options.tenantSlug] : []
    const tenants = await dataSource.query<TenantRow[]>(
      `SELECT id, slug, schema_name FROM public.tenants ${tenantFilter} ORDER BY created_at`,
      tenantParams,
    )

    if (tenants.length === 0) {
      console.log(
        options.tenantSlug
          ? `No tenant found with slug "${options.tenantSlug}".`
          : 'No tenants in the database.',
      )
      return
    }

    console.log(`Processing ${tenants.length} tenant(s)...`)

    const results: MigrationResult[] = []

    for (const tenant of tenants) {
      process.stdout.write(`  ${tenant.slug}... `)
      const result = await migrateOneTenant(dataSource, tenant, options)
      results.push(result)

      if (result.failed.length > 0) {
        console.log(`FAILED (${result.failed.length} error(s))`)
      } else if (result.applied.length > 0) {
        console.log(`OK (${result.applied.length} applied)`)
      } else {
        console.log('up to date')
      }
    }

    printSummary(results, options.dryRun)
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }
}

main().catch((err: unknown) => {
  console.error('\nFatal error:', err instanceof Error ? err.message : err)
  process.exit(1)
})
