import type { SmartListItem } from '@/shared/ui/organisms/data-table'

export function orderSmartLists(
  items: ReadonlyArray<SmartListItem>,
  listOrder: ReadonlyArray<string> | undefined,
  isFixedList: (id: string) => boolean,
): ReadonlyArray<SmartListItem> {
  if (!listOrder) return items
  const position = (id: string) => {
    if (isFixedList(id)) return -1
    const index = listOrder.indexOf(id)
    return index === -1 ? listOrder.length : index
  }
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return position(a.id) - position(b.id)
  })
}
