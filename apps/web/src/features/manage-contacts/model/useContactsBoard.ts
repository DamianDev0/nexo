'use client'

import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { useLocalStorageState } from '@/shared/lib/hooks/useLocalStorageState'
import { useDataTable } from '@/shared/ui/organisms/data-table'

import { buildContactColumns } from '../lib/contact-columns'
import { buildSmartLists, listIdToStatus, statusToListId } from '../lib/contact-lists'
import { buildQuickFilterDefs } from '../lib/quick-filters'
import { useArchiveContact } from '../query/useArchiveContact'
import { useContactCounts } from '../query/useContactCounts'

import { useContactsTable } from './useContactsTable'

import type { ContactListItem } from '@repo/shared-types'

const LIST_ORDER_KEY = 'contacts.list-order'

export function useContactsBoard() {
  const { t } = useTranslation()
  const table = useContactsTable()
  const counts = useContactCounts()
  const taxonomy = useContactTaxonomy()
  const { archive } = useArchiveContact()
  const [sheetContact, setSheetContact] = useState<ContactListItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [listOrder, setListOrder] = useLocalStorageState<readonly string[] | null>(
    LIST_ORDER_KEY,
    null,
  )

  const openCreate = useCallback(() => {
    setSheetContact(null)
    setSheetOpen(true)
  }, [])

  const openEdit = useCallback((contact: ContactListItem) => {
    setSheetContact(contact)
    setSheetOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      buildContactColumns(
        t,
        {
          onEdit: openEdit,
          onArchive: (contact) => archive([contact.id]),
        },
        taxonomy.statusByKey,
      ),
    [t, openEdit, archive, taxonomy.statusByKey],
  )

  const instance = useDataTable({
    data: table.rows,
    columns,
    pageSize: table.limit,
    getRowId: (row) => row.id,
    storageKey: 'contacts',
  })

  const selectedRows = instance.table.getSelectedRowModel().rows

  const archiveSelected = useCallback(() => {
    archive(selectedRows.map((row) => row.original.id))
    instance.table.resetRowSelection()
  }, [archive, selectedRows, instance])

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

  return {
    instance,
    lists: { items, activeId: statusToListId(table.status) },
    state: {
      search: table.search,
      total: table.total,
      page: table.page,
      totalPages: table.totalPages,
      limit: table.limit,
      isPending: table.isPending,
      isFiltered: table.isFiltered,
      isEmpty: !table.isPending && table.rows.length === 0,
      selectedCount: selectedRows.length,
      quickFilters: buildQuickFilterDefs(t, table.filters, taxonomy.sources),
    },
    actions: {
      onSelectList: selectList,
      onReorderLists: setListOrder,
      onSearch: table.handleSearch,
      onPageChange: table.setPage,
      onLimitChange: table.handleLimit,
      onCreate: openCreate,
      onArchiveSelected: archiveSelected,
      onToggleFilter: table.handleToggleFilter,
      onClearFilters: table.handleClearFilters,
    },
    sheet: { contact: sheetContact, open: sheetOpen, onOpenChange: setSheetOpen },
  }
}

export type ContactsBoard = ReturnType<typeof useContactsBoard>
