import type { QueryRunner } from 'typeorm'

function isUpdateDeleteTuple(result: unknown): result is [unknown[], number] {
  return (
    Array.isArray(result) &&
    result.length === 2 &&
    Array.isArray(result[0]) &&
    typeof result[1] === 'number'
  )
}

export async function sqlRows<T>(qr: QueryRunner, sql: string, params?: unknown[]): Promise<T> {
  const result = (await qr.query(sql, params)) as unknown
  return (isUpdateDeleteTuple(result) ? result[0] : result) as T
}
