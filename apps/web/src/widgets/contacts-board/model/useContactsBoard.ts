'use client'

import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useContactTaxonomy, useTaxonomyUsage } from '@/entities/contact-taxonomy'
import { useEntityTerms } from '@/entities/nomenclature'
import { filterSelection, useBulkActions } from '@/features/bulk-actions'
import { useObjectWorkspace, useTableLayout } from '@/features/customize-table'
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
import { useBoardKeyboard } from './useBoardKeyboard'
import { useBoardPreview } from './useBoardPreview'
import { useBoardSelection } from './useBoardSelection'
import { useBoardViews } from './useBoardViews'
import { useSkeletonHintSync } from './useSkeletonHintSync'

import type { ContactWorkspace } from '@repo/shared-types'

export function useContactsBoard() {
  const { t } = useTranslation()
  const table = useContactsTable()
  const counts = useContactCounts()
  const taxonomy = useContactTaxonomy()
  const terms = useEntityTerms('contact')
  const { sheet, preview, composers, archive, rowActions, rowContextMenu } = useBoardEditors()
  const workspace = useObjectWorkspace<ContactWorkspace>()
  const usage = useTaxonomyUsage()

  const catalog = workspace.data?.columns ?? EMPTY_COLUMNS
  const { layout, sort, setListOrder, applyState, saveStatus } = useTableLayout(
    catalog,
    workspace.data?.tableState ?? EMPTY_TABLE_STATE,
    { value: table.sort, onChange: table.handleSort },
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
    getRowId: (row) => row.id,
    layout,
    sort,
    totalRows: table.total,
    rowContextMenu,
  })

  const { openFromPreview, bulkRows, clearSelection } = useBoardSelection({
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
  const bulkFilter = useCallback(() => filterSelection(table.query), [table.query])
  const bulk = useBulkActions({
    archived: table.archived,
    total: table.total,
    rows: bulkRows,
    filterSelection: bulkFilter,
  })

  useBoardKeyboard({
    instance,
    bulk,
    editors: { sheetOpen: sheet.open, previewOpen: preview.open, openCreate: sheet.openCreate },
    clearSelection,
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
    setListOrder,
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
      isFailed: table.isError && table.rows.length === 0,
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
      onReorderLists: boardViews.reorderLists,
      onAdvancedChange: table.handleAdvanced,
      onSearch: table.handleSearch,
      onPageChange: table.handlePage,
      onRetry: table.retry,
      onPrefetchPage: table.prefetchPage,
      onLimitChange: table.handleLimit,
      onCreate: sheet.openCreate,
      onToggleFilter: table.handleToggleFilter,
      onClearFilters: table.handleClearFilters,
      onRevertFilters: boardViews.revertFilters,
    },
    composers,
    archive,
    bulk,
    sheet: { contact: sheet.editing, open: sheet.open, onOpenChange: sheet.setOpen },
    preview: previewRecord,
  }
}

export type ContactsBoard = ReturnType<typeof useContactsBoard>
