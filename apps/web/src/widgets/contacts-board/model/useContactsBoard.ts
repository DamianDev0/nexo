'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { buildContactColumns, writeSkeletonHint } from '@/entities/contact'
import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { useEntityTerms } from '@/entities/nomenclature'
import { useTagCatalog } from '@/entities/tag'
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

import { useContactRowActions } from './useContactRowActions'

import type { ContactColumnDef, ContactListItem, ContactTableState } from '@repo/shared-types'

const NO_COLUMNS: ReadonlyArray<ContactColumnDef> = []
const NO_TABLE_STATE: ContactTableState = {}

export function useContactsBoard() {
  const { t, i18n } = useTranslation()
  const table = useContactsTable()
  const counts = useContactCounts()
  const taxonomy = useContactTaxonomy()
  const terms = useEntityTerms('contact')
  const sheet = useEntityEditor<ContactListItem>()
  const preview = useEntityEditor<ContactListItem>()
  const { archive, isArchiving } = useArchiveContacts()
  const workspace = useContactWorkspace()

  useCreateFromUrl(sheet.openCreate)

  const catalog = workspace.data?.columns ?? NO_COLUMNS
  const { handleSort } = table
  const { layout, sort, setListOrder, saveStatus } = useContactsLayout(
    catalog,
    workspace.data?.tableState ?? NO_TABLE_STATE,
    { value: table.sort, onChange: handleSort },
  )

  const rowActions = useContactRowActions({
    onOpen: sheet.openEdit,
    onPreview: preview.openEdit,
  })

  const tagsByName = useTagCatalog('contact')

  const columns = useMemo(
    () =>
      buildContactColumns(catalog, {
        t,
        locale: i18n.language,
        entity: terms.lowerSingular,
        dense: layout.value.density === 'compact',
        statuses: taxonomy.statuses,
        actions: rowActions,
        taxonomy,
        tagsByName,
      }),
    [catalog, t, i18n.language, layout.value.density, taxonomy, rowActions, tagsByName, terms],
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

  const { setOpen: setPreviewOpen } = preview
  const { openEdit } = sheet
  const openFromPreview = useCallback(
    (contact: ContactListItem) => {
      setPreviewOpen(false)
      openEdit(contact)
    },
    [setPreviewOpen, openEdit],
  )

  const archiveSelected = useCallback(() => {
    const ids = instance.table.getSelectedRowModel().rows.map((row) => row.id)
    if (ids.length === 0) return
    instance.table.resetRowSelection()
    archive(ids)
  }, [instance.table, archive])

  const listOrder = workspace.data?.tableState.listOrder
  const items = useMemo(() => {
    const built = buildSmartLists(t, counts, taxonomy.statuses, {
      entity: terms.lowerSingular,
      entities: terms.lowerPlural,
    })
    if (!listOrder) return built
    return [...built].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return listOrder.indexOf(a.id) - listOrder.indexOf(b.id)
    })
  }, [t, counts, taxonomy.statuses, listOrder, terms])

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
        entityTerms: { entity: terms.lowerSingular, entities: terms.lowerPlural },
      }),
    [t, items, activeListId, counts, table.rows, terms],
  )

  const isPending = table.isPending || workspace.isPending
  const isUnavailable = !isPending && columns.length <= 1

  const { table: tanstackTable } = instance
  const rowCount = table.rows.length
  const lastHintRef = useRef('')
  useEffect(() => {
    if (isPending || isUnavailable) return
    const headers = tanstackTable.getHeaderGroups()[0]?.headers ?? []
    if (headers.length <= 1) return
    const hint = { widths: headers.map((header) => header.getSize()), rows: rowCount || 5 }
    const serialized = JSON.stringify(hint)
    if (serialized === lastHintRef.current) return
    lastHintRef.current = serialized
    writeSkeletonHint(hint)
  }, [isPending, isUnavailable, tanstackTable, rowCount, saveStatus])

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
      saveStatus,
      isArchiving,
      listHints,
      bulkLabels,
      quickFilters: buildQuickFilterDefs(
        t,
        table.filters,
        { sources: taxonomy.sources, lifecycleStages: taxonomy.lifecycleStages },
        terms.lowerSingular,
      ),
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
    preview: {
      contact: preview.editing,
      open: preview.open,
      onOpenChange: preview.setOpen,
      onEdit: openFromPreview,
      taxonomy,
    },
  }
}

export type ContactsBoard = ReturnType<typeof useContactsBoard>
