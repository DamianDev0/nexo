'use client'

import { useCallback, useRef, useState } from 'react'

import {
  capPins,
  dataPins,
  moveColumn,
  moveIntoPins,
  normalizePinning,
  seedLayout,
  toLayout,
} from '../lib/layout'
import { resolveUpdater } from '../lib/updater'

import type {
  DataTableDensity,
  DataTableLayout,
  DataTableLayoutBinding,
  DataTableLayoutState,
} from './types'
import type { OnChangeFn } from '@tanstack/react-table'

const EMPTY_LAYOUT: DataTableLayout = {}

export function useTableLayout(
  columnIds: ReadonlyArray<string>,
  binding: DataTableLayoutBinding | undefined,
) {
  const layout = binding?.value ?? EMPTY_LAYOUT
  const signature = columnIds.join('|')

  const [state, setState] = useState<DataTableLayoutState>(() => seedLayout(layout, columnIds))
  const [seeded, setSeeded] = useState(signature)
  const current = useRef(state)

  if (seeded !== signature) {
    const next = seedLayout(layout, columnIds)
    current.current = next
    setSeeded(signature)
    setState(next)
  }

  const emit = binding?.onChange

  const commit = useCallback(
    (patch: Partial<DataTableLayoutState>) => {
      const merged = { ...current.current, ...patch }
      const pinned = capPins(dataPins(merged.pinning), merged.order)
      const next = { ...merged, pinning: normalizePinning(pinned, merged.order) }

      current.current = next
      setState(next)
      emit?.(toLayout(next))
    },
    [emit],
  )

  const onColumnOrderChange: OnChangeFn<string[]> = useCallback(
    (updater) => commit({ order: resolveUpdater(updater, current.current.order) }),
    [commit],
  )

  const onColumnSizingChange: OnChangeFn<DataTableLayoutState['sizing']> = useCallback(
    (updater) => commit({ sizing: resolveUpdater(updater, current.current.sizing) }),
    [commit],
  )

  const onColumnPinningChange: OnChangeFn<DataTableLayoutState['pinning']> = useCallback(
    (updater) => {
      const { order, pinning } = current.current
      const wasPinned = dataPins(pinning)
      const requested = dataPins(resolveUpdater(updater, pinning))
      const added = requested.find((id) => !wasPinned.includes(id))

      if (!added) {
        commit({ pinning: normalizePinning(requested, order) })
        return
      }

      const nextOrder = moveIntoPins(order, added, wasPinned)
      commit({ order: nextOrder, pinning: normalizePinning(requested, nextOrder) })
    },
    [commit],
  )

  const onColumnVisibilityChange: OnChangeFn<DataTableLayoutState['visibility']> = useCallback(
    (updater) => commit({ visibility: resolveUpdater(updater, current.current.visibility) }),
    [commit],
  )

  const reorder = useCallback(
    (activeId: string, overId: string) => {
      const order = moveColumn(current.current.order, activeId, overId)
      if (!order) return

      const pinned = dataPins(current.current.pinning)
      const landsOnPinned = pinned.includes(overId)
      const next = landsOnPinned ? [...pinned, activeId] : pinned.filter((id) => id !== activeId)

      commit({ order, pinning: normalizePinning(next, order) })
    },
    [commit],
  )

  const setDensity = useCallback((density: DataTableDensity) => commit({ density }), [commit])

  return {
    state,
    reorder,
    setDensity,
    onColumnOrderChange,
    onColumnSizingChange,
    onColumnPinningChange,
    onColumnVisibilityChange,
  }
}
