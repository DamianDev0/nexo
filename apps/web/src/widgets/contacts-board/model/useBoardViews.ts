'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useAuth } from '@/entities/session'
import { listIdToStatus, type useContactsTable } from '@/features/filter-contacts'
import { defaultView, useContactViewsSection } from '@/features/manage-contact-views'

import { EMPTY_TABLE_STATE, EMPTY_VIEWS } from '../config/board-empty.constants'

import type { SmartListItem } from '@/shared/ui/organisms/data-table'
import type { ContactTableState, ContactView } from '@repo/shared-types'

type BoardViewsArgs = {
  readonly table: ReturnType<typeof useContactsTable>
  readonly workspace: { views?: ContactView[]; tableState?: ContactTableState }
  readonly items: ReadonlyArray<SmartListItem>
  readonly fallbackActiveId: string
  readonly applyTableState: (patch: ContactTableState) => void
}

export function useBoardViews({
  table,
  workspace,
  items,
  fallbackActiveId,
  applyTableState,
}: BoardViewsArgs) {
  const { data: me } = useAuth()
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
  const section = useContactViewsSection(
    views,
    viewSnapshot,
    {
      onAdvanced: table.handleAdvanced,
      onSearch: table.handleSearch,
      onSort: table.handleSort,
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
    revertFilters,
  }
}
