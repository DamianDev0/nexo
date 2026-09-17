'use client'

import { useCallback, useMemo } from 'react'

import { ShareNetworkIcon, StarIcon } from '@/shared/ui/icons'

import { VIEW_LIST_PREFIX } from '../config/view-list.constants'
import {
  isViewOwner,
  matchesSnapshot,
  sortViews,
  type ViewSnapshot,
  viewConditions,
  viewSearch,
} from '../lib/view-snapshot'

import type { SmartListItem } from '@/shared/ui/organisms/data-table'
import type {
  FilterCondition,
  ObjectView,
  ObjectViewColumns,
  ObjectViewSort,
} from '@repo/shared-types'

export type ApplyViewHandlers = {
  readonly onAdvanced: (conditions: ReadonlyArray<FilterCondition>) => void
  readonly onSearch: (value: string) => void
  readonly onSort: (value: ObjectViewSort | null) => void
  readonly onStatus: (value: string | null) => void
  readonly onLayout?: (columns: ObjectViewColumns, density: ObjectView['density']) => void
}

export function useViewsSection(
  views: ReadonlyArray<ObjectView>,
  snapshot: ViewSnapshot,
  apply: ApplyViewHandlers,
  viewerId?: string | null,
) {
  const { items, activeView } = useMemo(() => {
    const listItems: SmartListItem[] = sortViews(views).map((view) => ({
      id: `${VIEW_LIST_PREFIX}${view.id}`,
      label: view.name,
      description: view.description ?? undefined,
      icon: view.isFavorite ? StarIcon : isViewOwner(view, viewerId) ? undefined : ShareNetworkIcon,
    }))
    return {
      items: listItems,
      activeView: views.find((view) => matchesSnapshot(view, snapshot)) ?? null,
    }
  }, [views, snapshot, viewerId])

  const { onAdvanced, onSearch, onSort, onStatus, onLayout } = apply
  const selectView = useCallback(
    (listId: string): boolean => {
      if (!listId.startsWith(VIEW_LIST_PREFIX)) return false
      const view = views.find((entry) => entry.id === listId.slice(VIEW_LIST_PREFIX.length))
      if (!view) return true
      onStatus(null)
      onSearch(viewSearch(view))
      onSort(view.sort ?? null)
      onAdvanced(viewConditions(view))
      onLayout?.(view.columns, view.density)
      return true
    },
    [views, onAdvanced, onSearch, onSort, onStatus, onLayout],
  )

  return { items, activeView, selectView }
}
