import { VIEW_LIST_PREFIX } from '../config/view-list.constants'

import { isViewOwner } from './view-snapshot'

import type { ObjectView } from '@repo/shared-types'

export function ownedViewOrder(
  listOrder: ReadonlyArray<string>,
  views: ReadonlyArray<ObjectView>,
  viewerId: string | null,
): ReadonlyArray<string> {
  const owned = listOrder
    .filter((id) => id.startsWith(VIEW_LIST_PREFIX))
    .map((id) => id.slice(VIEW_LIST_PREFIX.length))
    .filter((id) => views.some((view) => view.id === id && isViewOwner(view, viewerId)))

  return owned.length > 1 ? owned : []
}
