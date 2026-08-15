'use client'

import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { useEntityEditor } from '@/shared/lib/hooks/useEntityEditor'
import { useLocalStorageState } from '@/shared/lib/hooks/useLocalStorageState'
import { useDataTable } from '@/shared/ui/organisms/data-table'

import {
  CONTACTS_PINNED_COLUMNS,
  CONTACTS_TABLE_STORAGE_KEY,
} from '../config/contacts-table.constants'
import { buildBulkLabels } from '../lib/bulk-labels'
import { buildContactColumns } from '../lib/contact-columns'
import { buildContactHints } from '../lib/contact-hints'
import { buildSmartLists, listIdToStatus, statusToListId } from '../lib/contact-lists'
import { buildQuickFilterDefs } from '../lib/quick-filters'
import { useArchiveContacts } from '../query/useArchiveContacts'
import { useContactCounts } from '../query/useContactCounts'

import { useContactsTable } from './useContactsTable'
import { useCreateFromUrl } from './useCreateFromUrl'

import type { ContactListItem } from '@repo/shared-types'

const LIST_ORDER_KEY = 'contacts.list-order'

export function useContactsBoard() {
  const { t } = useTranslation()
  const table = useContactsTable()
  const counts = useContactCounts()
  const taxonomy = useContactTaxonomy()
  const sheet = useEntityEditor<ContactListItem>()
  const { archive, isArchiving } = useArchiveContacts()
  const [listOrder, setListOrder] = useLocalStorageState<readonly string[] | null>(
    LIST_ORDER_KEY,
    null,
  )

  useCreateFromUrl(sheet.openCreate)

  const columns = useMemo(
    () =>
      buildContactColumns(t, {
        statusByKey: taxonomy.statusByKey,
        sourceByKey: taxonomy.sourceByKey,
        typeByKey: taxonomy.typeByKey,
      }),
    [t, taxonomy.statusByKey, taxonomy.sourceByKey, taxonomy.typeByKey],
  )

  const instance = useDataTable({
    data: table.rows,
    columns,
    pageSize: table.limit,
    getRowId: (row) => row.id,
    storageKey: CONTACTS_TABLE_STORAGE_KEY,
    pinnedColumns: CONTACTS_PINNED_COLUMNS,
    totalRows: table.total,
  })

  const archiveSelected = useCallback(() => {
    const ids = instance.table.getSelectedRowModel().rows.map((row) => row.id)
    if (ids.length === 0) return
    instance.table.resetRowSelection()
    archive(ids)
  }, [instance.table, archive])

  const items = useMemo(() => {
    const built = buildSmartLists(t, counts, taxonomy.statuses)
    if (!listOrder) return built
    return [...built].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return listOrder.indexOf(a.id) - listOrder.indexOf(b.id)
    })
  }, [t, counts, taxonomy.statuses, listOrder])

  const { handleStatus } = table
  const selectList = useCallback((id: string) => handleStatus(listIdToStatus(id)), [handleStatus])

  const bulkLabels = useMemo(() => buildBulkLabels(t), [t])

  const activeListId = statusToListId(table.status)
  const listHints = useMemo(
    () =>
      buildContactHints(t, {
        description: items.find((item) => item.id === activeListId)?.description,
        counts,
        withoutEmail: table.rows.filter((row) => !row.email).length,
      }),
    [t, items, activeListId, counts, table.rows],
  )

  return {
    instance,
    lists: { items, activeId: activeListId },
    state: {
      search: table.search,
      total: table.total,
      page: table.page,
      totalPages: table.totalPages,
      limit: table.limit,
      isPending: table.isPending,
      isFetching: table.isFetching,
      isFiltered: table.isFiltered,
      isEmpty: !table.isPending && table.rows.length === 0,
      isArchiving,
      listHints,
      bulkLabels,
      quickFilters: buildQuickFilterDefs(t, table.filters, taxonomy.sources),
    },
    actions: {
      onSelectList: selectList,
      onReorderLists: setListOrder,
      onSearch: table.handleSearch,
      onPageChange: table.handlePage,
      onPrefetchPage: table.prefetchPage,
      onLimitChange: table.handleLimit,
      onCreate: sheet.openCreate,
      onToggleFilter: table.handleToggleFilter,
      onClearFilters: table.handleClearFilters,
      onArchiveSelected: archiveSelected,
    },
    sheet: { contact: sheet.editing, open: sheet.open, onOpenChange: sheet.setOpen },
  }
}

export type ContactsBoard = ReturnType<typeof useContactsBoard>
