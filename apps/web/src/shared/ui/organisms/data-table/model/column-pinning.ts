'use client'

import { useCallback, useState } from 'react'

import { DATA_TABLE_SELECTION_ID } from '../config/table.constants'

import type { ColumnPinningState, OnChangeFn } from '@tanstack/react-table'

export function normalizePinning(
  left: ReadonlyArray<string>,
  columnIds: ReadonlyArray<string>,
): ColumnPinningState {
  const rank = new Map(columnIds.map((id, index) => [id, index]))
  const anchored = rank.has(DATA_TABLE_SELECTION_ID) ? [DATA_TABLE_SELECTION_ID] : []
  const rest = [...new Set(left)]
    .filter((id) => id !== DATA_TABLE_SELECTION_ID && rank.has(id))
    .sort((a, b) => (rank.get(a) ?? 0) - (rank.get(b) ?? 0))

  return { left: [...anchored, ...rest], right: [] }
}

export function useColumnPinning(
  columnIds: ReadonlyArray<string>,
  initial: ReadonlyArray<string> | undefined,
) {
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(() =>
    normalizePinning(initial ?? [], columnIds),
  )

  const onColumnPinningChange: OnChangeFn<ColumnPinningState> = useCallback(
    (updater) =>
      setColumnPinning((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        return normalizePinning(next.left ?? [], columnIds)
      }),
    [columnIds],
  )

  return { columnPinning, onColumnPinningChange }
}
