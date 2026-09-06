import type {
  BulkActionKind,
  BulkActionSelection,
  ContactListQuery,
  CreateBulkActionInput,
} from '@repo/shared-types'

export function filterSelection(query: ContactListQuery): BulkActionSelection {
  const { page: _page, limit: _limit, sortBy: _sortBy, sortDir: _sortDir, ...filters } = query
  return { mode: 'filter', query: filters }
}

export function idsSelection(ids: ReadonlyArray<string>): BulkActionSelection {
  return { mode: 'ids', ids: [...new Set(ids)] }
}

export function buildBulkRequest(
  action: BulkActionKind,
  selection: BulkActionSelection,
  params: Record<string, unknown> = {},
): CreateBulkActionInput {
  return { entity: 'contacts', action, params, selection }
}

export function selectionSize(selection: BulkActionSelection, total: number): number {
  return selection.mode === 'ids' ? selection.ids.length : total
}
