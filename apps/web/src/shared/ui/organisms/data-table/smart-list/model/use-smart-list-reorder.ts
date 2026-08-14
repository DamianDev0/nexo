'use client'

import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useMemo, useState } from 'react'

import { SMART_LIST_DRAG_THRESHOLD } from '../config/smart-list.constants'

import type { SmartListItem } from './smart-list.types'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'

export function useSmartListReorder(
  items: ReadonlyArray<SmartListItem>,
  onReorder?: (ids: readonly string[]) => void,
) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: SMART_LIST_DRAG_THRESHOLD } }),
  )
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const pinnedIds = useMemo(
    () => items.filter((item) => item.pinned).map((item) => item.id),
    [items],
  )

  const movableIds = useMemo(
    () => items.filter((item) => !item.pinned).map((item) => item.id),
    [items],
  )

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => setDraggingId(String(active.id)),
    [],
  )

  const handleDragCancel = useCallback(() => setDraggingId(null), [])

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setDraggingId(null)
      if (!over || active.id === over.id) return
      const from = movableIds.indexOf(String(active.id))
      const to = movableIds.indexOf(String(over.id))
      if (from < 0 || to < 0) return
      onReorder?.([...pinnedIds, ...arrayMove(movableIds, from, to)])
    },
    [movableIds, onReorder, pinnedIds],
  )

  return {
    sensors,
    movableIds,
    sortable: onReorder !== undefined,
    draggingItem: items.find((item) => item.id === draggingId) ?? null,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  }
}
