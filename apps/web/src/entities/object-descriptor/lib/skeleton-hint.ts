import { TENANT_COOKIE } from '@/shared/config/tenant-cookie'

const MAX_ROWS = 10
const MIN_ROWS = 3
const MAX_COLUMNS = 24

export interface RecordsSkeletonHint {
  readonly widths: ReadonlyArray<number>
  readonly rows: number
}

function tenantScope(): string {
  const match = new RegExp(`(?:^|; )${TENANT_COOKIE}=([^;]*)`).exec(document.cookie)
  return match?.[1] ?? 'default'
}

function storageKey(queryRoot: string): string {
  return `nexo:${queryRoot}-skeleton:${tenantScope()}`
}

export function readSkeletonHint(queryRoot: string): RecordsSkeletonHint | null {
  try {
    const raw = window.localStorage.getItem(storageKey(queryRoot))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const { widths, rows } = parsed as { widths?: unknown; rows?: unknown }
    if (!Array.isArray(widths) || widths.some((w) => typeof w !== 'number')) return null
    if (widths.length === 0 || widths.length > MAX_COLUMNS) return null
    if (typeof rows !== 'number') return null
    return { widths, rows: Math.min(Math.max(rows, MIN_ROWS), MAX_ROWS) }
  } catch {
    return null
  }
}

export function writeSkeletonHint(queryRoot: string, hint: RecordsSkeletonHint): void {
  try {
    window.localStorage.setItem(
      storageKey(queryRoot),
      JSON.stringify({ ...hint, widths: hint.widths.slice(0, MAX_COLUMNS) }),
    )
  } catch {
    return undefined
  }
}
