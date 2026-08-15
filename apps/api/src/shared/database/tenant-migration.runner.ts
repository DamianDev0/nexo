import type { QueryRunner } from 'typeorm'
import { TENANT_MIGRATIONS } from './tenant-migrations'
import type { MigrationRow } from './tenant-migration.interfaces'

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

export async function findPendingMigrations(
  qr: QueryRunner,
  schemaName: string,
): Promise<string[]> {
  const rows = (await qr.query(
    `SELECT id FROM "${schemaName}".schema_migrations`,
  )) as MigrationRow[]
  const applied = new Set(rows.map((row) => row.id))

  return TENANT_MIGRATIONS.filter((migration) => !applied.has(migration.id)).map((m) => m.id)
}

export async function applyPendingMigrations(
  qr: QueryRunner,
  schemaName: string,
  dryRun = false,
): Promise<TenantMigrationOutcome> {
  await ensureTrackingTable(qr, schemaName)

  const pending = await findPendingMigrations(qr, schemaName)
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
