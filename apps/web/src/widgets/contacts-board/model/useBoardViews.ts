'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import { contactSortFrom } from '@/entities/contact'
import { useAuth } from '@/entities/session'
import { listIdToStatus, type useContactsTable } from '@/features/filter-contacts'
import {
  defaultView,
  ownedViewOrder,
  useViewsAdmin,
  useViewsSection,
} from '@/features/manage-views'

import { EMPTY_TABLE_STATE, EMPTY_VIEWS } from '../config/board-empty.constants'

import type { SmartListItem } from '@/shared/ui/organisms/data-table'
import type { ContactTableState, ContactView } from '@repo/shared-types'

type BoardViewsArgs = {
  readonly table: ReturnType<typeof useContactsTable>
  readonly workspace: { views?: ContactView[]; tableState?: ContactTableState }
  readonly items: ReadonlyArray<SmartListItem>
  readonly fallbackActiveId: string
  readonly applyTableState: (patch: ContactTableState) => void
  readonly setListOrder: (ids: ReadonlyArray<string>) => void
}

export function useBoardViews({
  table,
  workspace,
  items,
  fallbackActiveId,
  applyTableState,
  setListOrder,
}: BoardViewsArgs) {
  const { data: me } = useAuth()
  const viewsAdmin = useViewsAdmin()
  const viewerId = me?.id ?? null

  const viewSnapshot = useMemo(
    () => ({
      advanced: table.advanced,
      search: table.search,
      sort: table.sort,
      tableState: workspace.tableState ?? EMPTY_TABLE_STATE,
    }),
    [table.advanced, table.search, table.sort, workspace.tableState],
  )

  const views = workspace.views ?? EMPTY_VIEWS
  const section = useViewsSection(
    views,
    viewSnapshot,
    {
      onAdvanced: table.handleAdvanced,
      onSearch: table.handleSearch,
      onSort: (sort) => table.handleSort(contactSortFrom(sort)),
      onStatus: table.handleStatus,
      onLayout: (columns, density) => applyTableState({ columns, density }),
    },
    viewerId,
  )

  const lastViewListIdRef = useRef<string | null>(null)
  const defaultAppliedRef = useRef(false)

  const { handleStatus, handleSearch, handleAdvanced, isFiltered } = table
  const selectList = useCallback(
    (id: string) => {
      if (section.selectView(id)) {
        lastViewListIdRef.current = id
        return
      }
      lastViewListIdRef.current = null
      handleStatus(listIdToStatus(id))
    },
    [section, handleStatus],
  )

  useEffect(() => {
    if (defaultAppliedRef.current || views.length === 0) return
    defaultAppliedRef.current = true
    if (isFiltered) return
    const view = defaultView(views, viewerId)
    if (view) selectList(`view:${view.id}`)
  }, [views, viewerId, isFiltered, selectList])

  const { reorder } = viewsAdmin
  const reorderLists = useCallback(
    (listOrder: ReadonlyArray<string>) => {
      setListOrder(listOrder)
      const owned = ownedViewOrder(listOrder, views, viewerId)
      if (owned.length > 0) reorder(owned)
    },
    [setListOrder, views, viewerId, reorder],
  )

  const revertFilters = useCallback(() => {
    const last = lastViewListIdRef.current
    if (last && section.selectView(last)) return
    handleSearch('')
    handleAdvanced([])
  }, [section, handleSearch, handleAdvanced])

  return {
    lists: {
      items: [...items, ...section.items],
      activeId: section.activeView ? `view:${section.activeView.id}` : fallbackActiveId,
    },
    viewSnapshot,
    activeView: section.activeView,
    viewerId,
    selectList,
    reorderLists,
    revertFilters,
  }
}
