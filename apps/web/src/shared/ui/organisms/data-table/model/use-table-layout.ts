'use client'

import { useCallback, useRef, useState } from 'react'

import { moveColumn, normalizePinning, seedLayout, toLayout } from '../lib/layout'
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
      const next = { ...merged, pinning: normalizePinning(merged.pinning.left ?? [], merged.order) }

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
    (updater) => commit({ pinning: resolveUpdater(updater, current.current.pinning) }),
    [commit],
  )

  const onColumnVisibilityChange: OnChangeFn<DataTableLayoutState['visibility']> = useCallback(
    (updater) => commit({ visibility: resolveUpdater(updater, current.current.visibility) }),
    [commit],
  )

  const reorder = useCallback(
    (activeId: string, overId: string) => {
      const order = moveColumn(current.current.order, activeId, overId)
      if (order) commit({ order })
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
