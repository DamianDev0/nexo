import type { QueryRunner } from 'typeorm'
import { applyPendingMigrations } from './tenant-migration.runner'
import { FOLDED_INTO_BASE_SCHEMA, TENANT_MIGRATIONS } from './tenant-migrations'

const SCHEMA = 'tenant_acme'

type Handler = (sql: string, params?: unknown[]) => unknown

function buildRunner(handler: Handler) {
  const query = jest.fn((sql: string, params?: unknown[]) => Promise.resolve(handler(sql, params)))
  const qr = {
    query,
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  } as unknown as QueryRunner
  return { qr, query }
}

function schemaState(options: { exists: boolean; applied: string[]; hasMarker: boolean }): Handler {
  return (sql) => {
    if (sql.includes('pg_namespace')) return options.exists ? [{ '?column?': 1 }] : []
    if (sql.includes('information_schema.columns'))
      return options.hasMarker ? [{ '?column?': 1 }] : []
    if (sql.startsWith('SELECT id FROM')) return options.applied.map((id) => ({ id }))
    return []
  }
}

describe('applyPendingMigrations', () => {
  it('reports a missing schema instead of throwing', async () => {
    const { qr, query } = buildRunner(schemaState({ exists: false, applied: [], hasMarker: false }))

    const outcome = await applyPendingMigrations(qr, SCHEMA)

    expect(outcome.failed?.id).toBe('schema')
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('baselines a schema provisioned from the base SQL before applying the rest', async () => {
    const { qr, query } = buildRunner(schemaState({ exists: true, applied: [], hasMarker: true }))

    const outcome = await applyPendingMigrations(qr, SCHEMA, true)

    const notFolded = TENANT_MIGRATIONS.map((m) => m.id).filter(
      (id) => !FOLDED_INTO_BASE_SCHEMA.has(id),
    )
    expect(outcome.pending).toEqual(notFolded)
    expect(query.mock.calls.some(([sql]) => sql.includes('INSERT INTO'))).toBe(false)
  })

  it('records the folded migrations when not in dry-run mode', async () => {
    const { qr, query } = buildRunner(schemaState({ exists: true, applied: [], hasMarker: true }))

    await applyPendingMigrations(qr, SCHEMA)

    const insert = query.mock.calls.find(([sql]) => sql.includes('ON CONFLICT (id) DO NOTHING'))
    expect(insert?.[1]).toEqual([[...FOLDED_INTO_BASE_SCHEMA]])
  })

  it('never baselines a schema that already tracks migrations', async () => {
    const applied = TENANT_MIGRATIONS.slice(0, 3).map((m) => m.id)
    const { qr, query } = buildRunner(schemaState({ exists: true, applied, hasMarker: true }))

    const outcome = await applyPendingMigrations(qr, SCHEMA, true)

    expect(outcome.pending).toHaveLength(TENANT_MIGRATIONS.length - 3)
    expect(query.mock.calls.some(([sql]) => sql.includes('ON CONFLICT (id) DO NOTHING'))).toBe(
      false,
    )
  })

  it('runs every migration on a schema that predates the base marker', async () => {
    const { qr } = buildRunner(schemaState({ exists: true, applied: [], hasMarker: false }))

    const outcome = await applyPendingMigrations(qr, SCHEMA, true)

    expect(outcome.pending).toHaveLength(TENANT_MIGRATIONS.length)
  })
})
