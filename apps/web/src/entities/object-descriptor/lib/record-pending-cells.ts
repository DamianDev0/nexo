export function pendingCellToken(id: string, key: string): string {
  return `${id}:${key}`
}

export function isColumnSaving(
  cells: ReadonlySet<string> | undefined,
  id: string,
  fields: ReadonlyArray<string>,
): boolean {
  if (!cells || cells.size === 0) return false
  return fields.some((field) => cells.has(pendingCellToken(id, field)))
}
