'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useAuth } from '@/entities/session'
import {
  defaultView,
  ownedViewOrder,
  useViewsAdmin,
  useViewsSection,
  VIEW_LIST_PREFIX,
} from '@/features/manage-views'

import { EMPTY_TABLE_STATE, EMPTY_VIEWS } from '../config/board-empty.constants'

import type { RecordSort } from '@/entities/object-descriptor'
import type { SmartListItem } from '@/shared/ui/organisms/data-table'
import type {
  FilterCondition,
  ObjectTableState,
  ObjectView,
  ObjectViewSort,
} from '@repo/shared-types'

export type BoardViewsTable = {
  readonly advanced: ReadonlyArray<FilterCondition>
  readonly search: string
  readonly sort: RecordSort | null
  readonly isFiltered: boolean
  readonly handleAdvanced: (conditions: ReadonlyArray<FilterCondition>) => void
  readonly handleSearch: (value: string) => void
  readonly handleSort: (sort: ObjectViewSort | null) => void
  readonly resetList: () => void
  readonly selectList: (listId: string) => void
}

type BoardViewsArgs = {
  readonly table: BoardViewsTable
  readonly workspace: { views?: ObjectView[]; tableState?: ObjectTableState }
  readonly items: ReadonlyArray<SmartListItem>
  readonly fallbackActiveId: string
  readonly applyTableState: (patch: ObjectTableState) => void
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
      onSort: table.handleSort,
      onStatus: table.resetList,
      onLayout: (columns, density) => applyTableState({ columns, density }),
    },
    viewerId,
  )

  const lastViewListIdRef = useRef<string | null>(null)
  const defaultAppliedRef = useRef(false)

  const { selectList: selectFallbackList, handleSearch, handleAdvanced, isFiltered } = table
  const selectList = useCallback(
    (id: string) => {
      if (section.selectView(id)) {
        lastViewListIdRef.current = id
        return
      }
      lastViewListIdRef.current = null
      selectFallbackList(id)
    },
    [section, selectFallbackList],
  )

  useEffect(() => {
    if (defaultAppliedRef.current || views.length === 0) return
    defaultAppliedRef.current = true
    if (isFiltered) return
    const view = defaultView(views, viewerId)
    if (view) selectList(`${VIEW_LIST_PREFIX}${view.id}`)
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
      activeId: section.activeView
        ? `${VIEW_LIST_PREFIX}${section.activeView.id}`
        : fallbackActiveId,
    },
    viewSnapshot,
    activeView: section.activeView,
    viewerId,
    selectList,
    reorderLists,
    revertFilters,
  }
}
