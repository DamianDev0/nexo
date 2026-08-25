const STORAGE_KEY = 'nexo:contacts-skeleton'
const MAX_ROWS = 10
const MIN_ROWS = 3

export interface ContactsSkeletonHint {
  readonly widths: ReadonlyArray<number>
  readonly rows: number
}

export function readSkeletonHint(): ContactsSkeletonHint | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const { widths, rows } = parsed as { widths?: unknown; rows?: unknown }
    if (!Array.isArray(widths) || widths.some((w) => typeof w !== 'number')) return null
    if (typeof rows !== 'number') return null
    return { widths, rows: Math.min(Math.max(rows, MIN_ROWS), MAX_ROWS) }
  } catch {
    return null
  }
}

export function writeSkeletonHint(hint: ContactsSkeletonHint): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hint))
  } catch {
    return undefined
  }
}
