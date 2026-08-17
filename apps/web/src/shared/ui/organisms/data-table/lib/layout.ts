import { DATA_TABLE_PIN_ZONE, DATA_TABLE_SELECTION_ID } from '../config/table.constants'

import type { DataTableLayout, DataTableLayoutState } from '../model/types'
import type { ColumnPinningState, VisibilityState } from '@tanstack/react-table'

export function reconcileOrder(
  stored: ReadonlyArray<string> | undefined,
  columnIds: ReadonlyArray<string>,
): string[] {
  if (!stored) return [...columnIds]

  const valid = new Set(columnIds)
  const order = stored.filter((id) => valid.has(id))
  const known = new Set(order)

  columnIds.forEach((id, index) => {
    if (known.has(id)) return
    order.splice(Math.min(index, order.length), 0, id)
  })

  return order
}

export function normalizePinning(
  left: ReadonlyArray<string>,
  columnIds: ReadonlyArray<string>,
): ColumnPinningState {
  const rank = new Map(columnIds.map((id, index) => [id, index]))
  const anchored = rank.has(DATA_TABLE_SELECTION_ID) ? [DATA_TABLE_SELECTION_ID] : []
  const rest = [...new Set(left)]
    .filter((id) => id !== DATA_TABLE_SELECTION_ID && rank.has(id))
    .sort((a, b) => (rank.get(a) ?? 0) - (rank.get(b) ?? 0))

  return { left: [...anchored, ...rest], right: [] }
}

export function dataPins(pinning: ColumnPinningState): string[] {
  return (pinning.left ?? []).filter((id) => id !== DATA_TABLE_SELECTION_ID)
}

export function defaultPins(
  order: ReadonlyArray<string>,
  visibility: VisibilityState,
  cap = DATA_TABLE_PIN_ZONE,
): string[] {
  return order
    .filter((id) => id !== DATA_TABLE_SELECTION_ID && visibility[id] !== false)
    .slice(0, cap)
}

export function capPins(
  pinned: ReadonlyArray<string>,
  order: ReadonlyArray<string>,
  cap = DATA_TABLE_PIN_ZONE,
): string[] {
  const rank = new Map(order.map((id, index) => [id, index]))
  return [...new Set(pinned)].sort((a, b) => (rank.get(a) ?? 0) - (rank.get(b) ?? 0)).slice(0, cap)
}

export function moveIntoPins(
  order: ReadonlyArray<string>,
  id: string,
  pinned: ReadonlyArray<string>,
): string[] {
  const next = order.filter((candidate) => candidate !== id)
  const lastPinned = [...next].reverse().find((candidate) => pinned.includes(candidate))
  const at = lastPinned === undefined ? 0 : next.indexOf(lastPinned) + 1

  next.splice(Math.max(at, order.indexOf(DATA_TABLE_SELECTION_ID) + 1), 0, id)
  return next
}

export function seedLayout(
  layout: DataTableLayout,
  columnIds: ReadonlyArray<string>,
): DataTableLayoutState {
  const hidden = new Set(layout.hidden ?? [])

  const order = reconcileOrder(layout.order, columnIds)
  const visibility = Object.fromEntries(
    columnIds.filter((id) => hidden.has(id)).map((id) => [id, false] as const),
  )
  const pinned = layout.pinnedLeft ?? defaultPins(order, visibility)

  return {
    order,
    sizing: { ...layout.widths },
    pinning: normalizePinning(capPins(pinned, order), order),
    visibility,
    density: layout.density ?? 'comfortable',
  }
}

export function toLayout(state: DataTableLayoutState): DataTableLayout {
  return {
    order: state.order.filter((id) => id !== DATA_TABLE_SELECTION_ID),
    hidden: Object.entries(state.visibility)
      .filter(([, visible]) => !visible)
      .map(([id]) => id),
    widths: { ...state.sizing },
    pinnedLeft: (state.pinning.left ?? []).filter((id) => id !== DATA_TABLE_SELECTION_ID),
    density: state.density,
  }
}

export function moveColumn(
  order: ReadonlyArray<string>,
  activeId: string,
  overId: string,
): string[] | null {
  const from = order.indexOf(activeId)
  const to = order.indexOf(overId)
  if (from < 0 || to < 0 || from === to) return null

  const next = [...order]
  const [moved] = next.splice(from, 1)
  if (!moved) return null

  next.splice(to, 0, moved)
  return next
}
