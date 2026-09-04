'use client'

import { useCallback, useMemo, useRef } from 'react'

import { listIdToStatus, type useContactsTable } from '@/features/filter-contacts'
import { useContactViewsSection } from '@/features/manage-contact-views'

import { EMPTY_TABLE_STATE, EMPTY_VIEWS } from '../config/board-empty.constants'

import type { SmartListItem } from '@/shared/ui/organisms/data-table'
import type { ContactTableState, ContactView } from '@repo/shared-types'

type BoardViewsArgs = {
  readonly table: ReturnType<typeof useContactsTable>
  readonly workspace: { views?: ContactView[]; tableState?: ContactTableState }
  readonly items: ReadonlyArray<SmartListItem>
  readonly fallbackActiveId: string
}

export function useBoardViews({ table, workspace, items, fallbackActiveId }: BoardViewsArgs) {
  const viewSnapshot = useMemo(
    () => ({
      advanced: table.advanced,
      search: table.search,
      sort: table.sort,
      tableState: workspace.tableState ?? EMPTY_TABLE_STATE,
    }),
    [table.advanced, table.search, table.sort, workspace.tableState],
  )

  const section = useContactViewsSection(workspace.views ?? EMPTY_VIEWS, viewSnapshot, {
    onAdvanced: table.handleAdvanced,
    onSearch: table.handleSearch,
    onSort: table.handleSort,
    onStatus: table.handleStatus,
  })

  const lastViewListIdRef = useRef<string | null>(null)

  const { handleStatus, handleSearch, handleAdvanced } = table
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
    selectList,
    revertFilters,
  }
}
