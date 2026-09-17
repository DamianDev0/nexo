import { contactSortFrom } from '@/entities/contact'
import { isArchivedList, listIdToStatus, ownerList } from '@/features/filter-contacts'

import type { buildQuickFilterDefs, useContactsTable } from '@/features/filter-contacts'
import type { BoardViewsTable } from '@/widgets/records-board'

type QuickFilterSources = Parameters<typeof buildQuickFilterDefs>[2]

export function quickFilterSources(
  taxonomy: Pick<QuickFilterSources, 'sources' | 'lifecycleStages'>,
  usage: NonNullable<QuickFilterSources['usage']>,
): QuickFilterSources {
  return {
    sources: taxonomy.sources,
    lifecycleStages: taxonomy.lifecycleStages,
    usage: { sources: usage.sources, lifecycleStages: usage.lifecycleStages },
  }
}

export function isFixedContactList(id: string): boolean {
  return isArchivedList(id) || ownerList(id) !== null
}

export type ContactViewsTable = Pick<
  ReturnType<typeof useContactsTable>,
  | 'advanced'
  | 'search'
  | 'sort'
  | 'isFiltered'
  | 'handleAdvanced'
  | 'handleSearch'
  | 'handleSort'
  | 'handleStatus'
>

export function toBoardViewsTable(table: ContactViewsTable): BoardViewsTable {
  return {
    advanced: table.advanced,
    search: table.search,
    sort: table.sort,
    isFiltered: table.isFiltered,
    handleAdvanced: table.handleAdvanced,
    handleSearch: table.handleSearch,
    handleSort: (sort) => table.handleSort(contactSortFrom(sort)),
    resetList: () => table.handleStatus(null),
    selectList: (id) => table.handleStatus(listIdToStatus(id)),
  }
}
