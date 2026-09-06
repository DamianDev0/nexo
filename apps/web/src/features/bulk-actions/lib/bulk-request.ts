import { listQueryFilters } from '@/entities/contact'

import type { BulkActionSelection, ContactListQuery } from '@repo/shared-types'

export function filterSelection(query: ContactListQuery): BulkActionSelection {
  return { mode: 'filter', query: listQueryFilters(query) }
}

export function idsSelection(ids: ReadonlyArray<string>): BulkActionSelection {
  return { mode: 'ids', ids: [...new Set(ids)] }
}

export function selectionSize(selection: BulkActionSelection, total: number): number {
  return selection.mode === 'ids' ? selection.ids.length : total
}
