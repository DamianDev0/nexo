import type { Row, Table } from '@tanstack/react-table'

export function rowRange(
  ids: ReadonlyArray<string>,
  anchor: string | null,
  target: string,
): ReadonlyArray<string> {
  const from = anchor === null ? -1 : ids.indexOf(anchor)
  const to = ids.indexOf(target)
  if (from === -1 || to === -1) return [target]
  const [start, end] = from < to ? [from, to] : [to, from]
  return ids.slice(start, end + 1)
}

export function selectRowRange<TData>(
  table: Table<TData>,
  row: Row<TData>,
  extend: boolean,
): boolean {
  const anchor = table.options.meta?.selectionAnchor
  if (!anchor) return false
  if (!extend || anchor.current === null) {
    anchor.current = row.id
    return false
  }
  const ids = rowRange(
    table.getRowModel().rows.map((candidate) => candidate.id),
    anchor.current,
    row.id,
  )
  table.setRowSelection((previous) => ({
    ...previous,
    ...Object.fromEntries(ids.map((id) => [id, true])),
  }))
  return true
}
