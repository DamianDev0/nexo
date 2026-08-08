import type { QueryRunner } from 'typeorm'

export async function sqlRows<T>(qr: QueryRunner, sql: string, params?: unknown[]): Promise<T> {
  return qr.query(sql, params) as Promise<T>
}
