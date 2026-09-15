import type { QueryRunner } from 'typeorm'
import { FOLDED_INTO_BASE_SCHEMA, TENANT_MIGRATIONS } from './tenant-migrations'
import type { MigrationRow } from './tenant-migration.interfaces'

const BASE_SCHEMA_MARKER = { table: 'contacts', column: 'merged_into_id' }

export interface TenantMigrationOutcome {
  applied: string[]
  pending: string[]
  failed: { id: string; error: string } | null
}

export async function ensureTrackingTable(qr: QueryRunner, schemaName: string): Promise<void> {
  await qr.query(`
    CREATE TABLE IF NOT EXISTS "${schemaName}".schema_migrations (
      id         VARCHAR(100) PRIMARY KEY,
      applied_at TIMESTAMPTZ  DEFAULT NOW()
    )
  `)
}

export async function markMigrationsApplied(
  qr: QueryRunner,
  schemaName: string,
  ids: ReadonlyArray<string>,
): Promise<void> {
  if (ids.length === 0) return
  await qr.query(
    `INSERT INTO "${schemaName}".schema_migrations (id)
     SELECT unnest($1::text[])
     ON CONFLICT (id) DO NOTHING`,
    [ids],
  )
}

async function appliedMigrationIds(qr: QueryRunner, schemaName: string): Promise<Set<string>> {
  const rows = (await qr.query(
    `SELECT id FROM "${schemaName}".schema_migrations`,
  )) as MigrationRow[]
  return new Set(rows.map((row) => row.id))
}

async function schemaExists(qr: QueryRunner, schemaName: string): Promise<boolean> {
  const rows = (await qr.query(`SELECT 1 FROM pg_namespace WHERE nspname = $1`, [
    schemaName,
  ])) as unknown[]
  return rows.length > 0
}

async function provisionedFromBaseSchema(qr: QueryRunner, schemaName: string): Promise<boolean> {
  const rows = (await qr.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
    [schemaName, BASE_SCHEMA_MARKER.table, BASE_SCHEMA_MARKER.column],
  )) as unknown[]
  return rows.length > 0
}

export async function baselineProvisionedSchema(
  qr: QueryRunner,
  schemaName: string,
  dryRun = false,
): Promise<boolean> {
  const applied = await appliedMigrationIds(qr, schemaName)
  if (applied.size > 0 || !(await provisionedFromBaseSchema(qr, schemaName))) return false
  if (!dryRun) await markMigrationsApplied(qr, schemaName, [...FOLDED_INTO_BASE_SCHEMA])
  return true
}

export async function findPendingMigrations(
  qr: QueryRunner,
  schemaName: string,
  baselined = false,
): Promise<string[]> {
  const applied = await appliedMigrationIds(qr, schemaName)
  return TENANT_MIGRATIONS.filter(
    (migration) =>
      !applied.has(migration.id) && !(baselined && FOLDED_INTO_BASE_SCHEMA.has(migration.id)),
  ).map((m) => m.id)
}

export async function applyPendingMigrations(
  qr: QueryRunner,
  schemaName: string,
  dryRun = false,
): Promise<TenantMigrationOutcome> {
  if (!(await schemaExists(qr, schemaName))) {
    return {
      applied: [],
      pending: [],
      failed: { id: 'schema', error: `Schema "${schemaName}" does not exist` },
    }
  }
  await ensureTrackingTable(qr, schemaName)
  const baselined = await baselineProvisionedSchema(qr, schemaName, dryRun)

  const pending = await findPendingMigrations(qr, schemaName, baselined)
  const outcome: TenantMigrationOutcome = { applied: [], pending, failed: null }

  if (dryRun) return outcome

  for (const id of pending) {
    const migration = TENANT_MIGRATIONS.find((candidate) => candidate.id === id)
    if (!migration) continue

    await qr.startTransaction()
    try {
      await qr.query(migration.up(schemaName))
      await qr.query(`INSERT INTO "${schemaName}".schema_migrations (id) VALUES ($1)`, [id])
      await qr.commitTransaction()
      outcome.applied.push(id)
    } catch (err) {
      await qr.rollbackTransaction()
      outcome.failed = { id, error: err instanceof Error ? err.message : String(err) }
      return outcome
    }
  }

  return outcome
}
