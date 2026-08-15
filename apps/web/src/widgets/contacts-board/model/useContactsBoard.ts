'use client'

import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { buildContactColumns } from '@/entities/contact'
import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { buildBulkLabels, useArchiveContacts } from '@/features/archive-contacts'
import { useCreateFromUrl } from '@/features/create-contact'
import { useContactsLayout, useContactWorkspace } from '@/features/customize-contacts-table'
import {
  buildContactHints,
  buildQuickFilterDefs,
  buildSmartLists,
  listIdToStatus,
  statusToListId,
  useContactCounts,
  useContactsTable,
} from '@/features/filter-contacts'
import { useEntityEditor } from '@/shared/lib/hooks/useEntityEditor'
import { useDataTable } from '@/shared/ui/organisms/data-table'

import type { ContactColumnDef, ContactListItem, ContactTableState } from '@repo/shared-types'

const NO_COLUMNS: ReadonlyArray<ContactColumnDef> = []
const NO_TABLE_STATE: ContactTableState = {}

export function useContactsBoard() {
  const { t } = useTranslation()
  const table = useContactsTable()
  const counts = useContactCounts()
  const taxonomy = useContactTaxonomy()
  const sheet = useEntityEditor<ContactListItem>()
  const { archive, isArchiving } = useArchiveContacts()
  const workspace = useContactWorkspace()

  useCreateFromUrl(sheet.openCreate)

  const catalog = workspace.data?.columns ?? NO_COLUMNS
  const { handleSort } = table
  const { layout, sort, setListOrder } = useContactsLayout(
    catalog,
    workspace.data?.tableState ?? NO_TABLE_STATE,
    { value: table.sort, onChange: handleSort },
  )

  const columns = useMemo(
    () =>
      buildContactColumns(catalog, {
        t,
        taxonomy: {
          statusByKey: taxonomy.statusByKey,
          sourceByKey: taxonomy.sourceByKey,
          typeByKey: taxonomy.typeByKey,
        },
      }),
    [catalog, t, taxonomy.statusByKey, taxonomy.sourceByKey, taxonomy.typeByKey],
  )

  const instance = useDataTable({
    data: table.rows,
    columns,
    pageSize: table.limit,
    getRowId: (row) => row.id,
    layout,
    sort,
    totalRows: table.total,
  })

  const archiveSelected = useCallback(() => {
    const ids = instance.table.getSelectedRowModel().rows.map((row) => row.id)
    if (ids.length === 0) return
    instance.table.resetRowSelection()
    archive(ids)
  }, [instance.table, archive])

  const listOrder = workspace.data?.tableState.listOrder
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

  const isPending = table.isPending || workspace.isPending
  const isUnavailable = !isPending && columns.length <= 1

  return {
    instance,
    lists: { items, activeId: activeListId },
    state: {
      search: table.search,
      total: table.total,
      page: table.page,
      totalPages: table.totalPages,
      limit: table.limit,
      isPending,
      isFetching: table.isFetching,
      isFiltered: table.isFiltered,
      isEmpty: !isPending && table.rows.length === 0,
      isUnavailable,
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
