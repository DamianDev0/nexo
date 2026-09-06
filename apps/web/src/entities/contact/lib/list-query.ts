import type { ContactListQuery } from '@repo/shared-types'

export type ContactListFilters = Omit<ContactListQuery, 'page' | 'limit' | 'sortBy' | 'sortDir'>

export function listQueryFilters(query: ContactListQuery): ContactListFilters {
  const { page: _page, limit: _limit, sortBy: _sortBy, sortDir: _sortDir, ...filters } = query
  return filters
}
