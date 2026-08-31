'use client'

import { useCallback, useMemo } from 'react'

import { listIdToStatus, useContactsTable } from '@/features/filter-contacts'
import { useContactViewsSection } from '@/features/manage-contact-views'

import type { SmartListItem } from '@/shared/ui/organisms/data-table'
import type { ContactTableState, ContactView } from '@repo/shared-types'

const NO_TABLE_STATE: ContactTableState = {}
const NO_VIEWS: ReadonlyArray<ContactView> = []

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
      tableState: workspace.tableState ?? NO_TABLE_STATE,
    }),
    [table.advanced, table.search, table.sort, workspace.tableState],
  )

  const section = useContactViewsSection(workspace.views ?? NO_VIEWS, viewSnapshot, {
    onAdvanced: table.handleAdvanced,
    onSearch: table.handleSearch,
    onSort: table.handleSort,
    onStatus: table.handleStatus,
  })

  const { handleStatus } = table
  const selectList = useCallback(
    (id: string) => {
      if (section.selectView(id)) return
      handleStatus(listIdToStatus(id))
    },
    [section, handleStatus],
  )

  return {
    lists: {
      items: [...items, ...section.items],
      activeId: section.activeView ? `view:${section.activeView.id}` : fallbackActiveId,
    },
    viewSnapshot,
    activeView: section.activeView,
    selectList,
  }
}
