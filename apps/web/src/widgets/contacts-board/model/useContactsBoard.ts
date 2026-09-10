'use client'

import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useContactTaxonomy, useTaxonomyUsage } from '@/entities/contact-taxonomy'
import { useEntityTerms } from '@/entities/nomenclature'
import { filterSelection, useBulkActions } from '@/features/bulk-actions'
import { useContactsLayout, useContactWorkspace } from '@/features/customize-contacts-table'
import {
  buildContactHints,
  buildQuickFilterDefs,
  buildSmartLists,
  statusToListId,
  useContactCounts,
  useContactsTable,
  useAdvancedFilterFields,
} from '@/features/filter-contacts'
import { useDataTable } from '@/shared/ui/organisms/data-table'

import { EMPTY_COLUMNS, EMPTY_TABLE_STATE, EMPTY_VIEWS } from '../config/board-empty.constants'
import { orderSmartLists } from '../lib/order-smart-lists'
import { selectionScopeKey } from '../lib/selection-scope'

import { useBoardColumns } from './useBoardColumns'
import { useBoardEditors } from './useBoardEditors'
import { useBoardHotkeys } from './useBoardHotkeys'
import { useBoardPreview } from './useBoardPreview'
import { useBoardSelection } from './useBoardSelection'
import { useBoardViews } from './useBoardViews'
import { useSkeletonHintSync } from './useSkeletonHintSync'

export function useContactsBoard() {
  const { t } = useTranslation()
  const table = useContactsTable()
  const counts = useContactCounts()
  const taxonomy = useContactTaxonomy()
  const terms = useEntityTerms('contact')
  const { sheet, preview, composers, rowActions } = useBoardEditors()
  const workspace = useContactWorkspace()
  const usage = useTaxonomyUsage()

  useBoardHotkeys({ onCreate: sheet.openCreate, enabled: !sheet.open && !preview.open })

  const catalog = workspace.data?.columns ?? EMPTY_COLUMNS
  const { handleSort } = table
  const { layout, sort, setListOrder, applyState, saveStatus } = useContactsLayout(
    catalog,
    workspace.data?.tableState ?? EMPTY_TABLE_STATE,
    { value: table.sort, onChange: handleSort },
  )

  const columns = useBoardColumns({
    catalog,
    taxonomy,
    rowActions,
    entity: terms.lowerSingular,
    dense: layout.value.density === 'compact',
  })

  const instance = useDataTable({
    data: table.rows,
    columns,
    pageSize: table.limit,
    getRowId: (row) => row.id,
    layout,
    sort,
    totalRows: table.total,
  })

  const { openFromPreview, selectedIds, selectedTags, clearSelection } = useBoardSelection({
    instance,
    scopeKey: selectionScopeKey(table.query),
    closePreview: () => preview.setOpen(false),
    openEdit: sheet.openEdit,
  })
  const previewRecord = useBoardPreview({
    editor: preview,
    rowActions,
    openFromPreview,
    siblings: table.rows,
    taxonomy,
  })
  const { query: tableQuery } = table
  const bulkFilter = useCallback(() => filterSelection(tableQuery), [tableQuery])
  const bulk = useBulkActions({
    archived: table.archived,
    total: table.total,
    rows: {
      selectedIds,
      selectedTags,
      selectedCount: instance.selection.count,
      clear: clearSelection,
    },
    filterSelection: bulkFilter,
  })

  const listOrder = workspace.data?.tableState.listOrder
  const items = useMemo(
    () =>
      orderSmartLists(
        buildSmartLists(t, counts, taxonomy.statuses, {
          entity: terms.lowerSingular,
          entities: terms.lowerPlural,
        }),
        listOrder,
      ),
    [t, counts, taxonomy.statuses, listOrder, terms],
  )
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
    applyTableState: applyState,
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
      isArchived: table.archived,
      isEmpty: !isPending && table.rows.length === 0,
      isUnavailable,
      saveStatus,
      unassignedRecent: counts.unassignedRecent ?? 0,
      listHints,
      advanced: table.advanced,
      advancedFields,
      viewSnapshot: boardViews.viewSnapshot,
      activeView: boardViews.activeView,
      viewerId: boardViews.viewerId,
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
    preview: previewRecord,
  }
}

export type ContactsBoard = ReturnType<typeof useContactsBoard>
