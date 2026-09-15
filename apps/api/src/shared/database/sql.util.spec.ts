import { QueryFailedError, type QueryRunner } from 'typeorm'
import { isUniqueViolation, sqlRows } from './sql.util'

describe('isUniqueViolation', () => {
  const failure = (code: string, constraint: string) =>
    new QueryFailedError('INSERT', [], Object.assign(new Error('dup'), { code, constraint }))

  it('recognizes a 23505 whose constraint matches the pattern', () => {
    expect(
      isUniqueViolation(failure('23505', 'uq_tenant_a_contacts_email_active'), /_email_/),
    ).toBe(true)
  })

  it('ignores other codes, other constraints and non-database errors', () => {
    expect(isUniqueViolation(failure('23503', 'uq_x'), /uq_/)).toBe(false)
    expect(isUniqueViolation(failure('23505', 'uq_views_default'), /_contacts_/)).toBe(false)
    expect(isUniqueViolation(new Error('boom'))).toBe(false)
  })
})

function runnerReturning(result: unknown): QueryRunner {
  return { query: jest.fn().mockResolvedValue(result) } as unknown as QueryRunner
}

describe('sqlRows', () => {
  it('returns SELECT and INSERT rows as-is', async () => {
    const rows = [{ id: '1' }, { id: '2' }]
    await expect(sqlRows(runnerReturning(rows), 'SELECT 1')).resolves.toBe(rows)
  })

  it('unwraps the TypeORM [rows, affected] tuple from UPDATE/DELETE RETURNING', async () => {
    const rows = [{ id: '1', custom_fields: { eps: 'Sura' } }]
    await expect(sqlRows(runnerReturning([rows, 1]), 'UPDATE x RETURNING *')).resolves.toBe(rows)
    await expect(sqlRows(runnerReturning([[], 0]), 'DELETE FROM x RETURNING id')).resolves.toEqual(
      [],
    )
  })

  it('does not mistake two result rows for a tuple', async () => {
    const rows = [
      [1, 2],
      [3, 4],
    ]
    await expect(sqlRows(runnerReturning(rows), 'SELECT pair')).resolves.toBe(rows)
  })
})
