import { QueryFailedError, type QueryRunner } from 'typeorm'

const UNIQUE_VIOLATION = '23505'

export function isUniqueViolation(error: unknown, constraint?: RegExp): boolean {
  if (!(error instanceof QueryFailedError)) return false
  const driverError = error.driverError as { code?: string; constraint?: string }
  if (driverError.code !== UNIQUE_VIOLATION) return false
  return constraint === undefined || constraint.test(driverError.constraint ?? '')
}

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
