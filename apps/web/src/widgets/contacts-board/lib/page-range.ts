export interface PageRange {
  readonly from: number
  readonly to: number
  readonly total: number
}

export function pageRange(page: number, limit: number, total: number): PageRange {
  if (total <= 0 || limit <= 0) return { from: 0, to: 0, total: Math.max(total, 0) }

  const from = (Math.max(page, 1) - 1) * limit + 1
  if (from > total) return { from: total, to: total, total }

  return { from, to: Math.min(from + limit - 1, total), total }
}
