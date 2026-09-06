'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { buildContactColumns } from '@/entities/contact'
import { useContactTaxonomy, useTaxonomyUsage } from '@/entities/contact-taxonomy'
import { useEntityTerms } from '@/entities/nomenclature'
import { useTagCatalog } from '@/entities/tag'
import { useBulkActions } from '@/features/bulk-actions'
import { useContactsLayout, useContactWorkspace } from '@/features/customize-contacts-table'
import {
  buildContactHints,
  buildQuickFilterDefs,
  buildSmartLists,
  isArchivedList,
  statusToListId,
  useContactCounts,
  useContactsTable,
  useAdvancedFilterFields,
} from '@/features/filter-contacts'
import { useDataTable } from '@/shared/ui/organisms/data-table'

import { EMPTY_COLUMNS, EMPTY_TABLE_STATE, EMPTY_VIEWS } from '../config/board-empty.constants'

import { useBoardEditors } from './useBoardEditors'
import { useBoardSelection } from './useBoardSelection'
import { useBoardViews } from './useBoardViews'
import { useSkeletonHintSync } from './useSkeletonHintSync'

export function useContactsBoard() {
  const { t, i18n } = useTranslation()
  const table = useContactsTable()
  const counts = useContactCounts()
  const taxonomy = useContactTaxonomy()
  const terms = useEntityTerms('contact')
  const { sheet, preview, composers, rowActions } = useBoardEditors()
  const workspace = useContactWorkspace()
  const usage = useTaxonomyUsage()

  const catalog = workspace.data?.columns ?? EMPTY_COLUMNS
  const { handleSort } = table
  const { layout, sort, setListOrder, saveStatus } = useContactsLayout(
    catalog,
    workspace.data?.tableState ?? EMPTY_TABLE_STATE,
    { value: table.sort, onChange: handleSort },
  )

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

  const { openFromPreview, selectedIds, clearSelection } = useBoardSelection({
    instance,
    closePreview: () => preview.setOpen(false),
    openEdit: sheet.openEdit,
  })
  const bulk = useBulkActions({
    selectedIds,
    clearSelection,
    query: table.query,
    total: table.total,
  })

  const listOrder = workspace.data?.tableState.listOrder
  const items = useMemo(() => {
    const built = buildSmartLists(t, counts, taxonomy.statuses, {
      entity: terms.lowerSingular,
      entities: terms.lowerPlural,
    })
    if (!listOrder) return built
    const position = (id: string) => {
      if (isArchivedList(id)) return -1
      const index = listOrder.indexOf(id)
      return index === -1 ? listOrder.length : index
    }
    return [...built].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return position(a.id) - position(b.id)
    })
  }, [t, counts, taxonomy.statuses, listOrder, terms])
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

  const advancedFields = useAdvancedFilterFields(catalog)

  const isPending = table.isPending || workspace.isPending
  const isUnavailable = !isPending && columns.length <= 1

  useSkeletonHintSync(instance.table, table.rows.length, !isPending && !isUnavailable, saveStatus)

  const boardViews = useBoardViews({
    table,
    workspace: { views: workspace.data?.views, tableState: workspace.data?.tableState },
    items,
    fallbackActiveId: activeListId,
  })

  return {
    instance,
    lists: boardViews.lists,
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
      listHints,
      advanced: table.advanced,
      advancedFields,
      viewSnapshot: boardViews.viewSnapshot,
      activeView: boardViews.activeView,
      views: workspace.data?.views ?? EMPTY_VIEWS,
      quickFilters: buildQuickFilterDefs(
        t,
        table.filters,
        {
          sources: taxonomy.sources,
          lifecycleStages: taxonomy.lifecycleStages,
          usage: { sources: usage.sources, lifecycleStages: usage.lifecycleStages },
        },
        terms.lowerSingular,
      ),
    },
    actions: {
      onSelectList: boardViews.selectList,
      onReorderLists: setListOrder,
      onAdvancedChange: table.handleAdvanced,
      onSearch: table.handleSearch,
      onPageChange: table.handlePage,
      onPrefetchPage: table.prefetchPage,
      onLimitChange: table.handleLimit,
      onCreate: sheet.openCreate,
      onToggleFilter: table.handleToggleFilter,
      onClearFilters: table.handleClearFilters,
      onRevertFilters: boardViews.revertFilters,
    },
    composers,
    bulk,
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
