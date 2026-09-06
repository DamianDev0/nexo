'use client'

import { useCallback, useEffect, useState } from 'react'

import { idsSelection, selectionSize } from '../lib/bulk-request'

import type { BulkActionSelection } from '@repo/shared-types'

type BulkSelectionArgs = {
  readonly selectedIds: () => string[]
  readonly selectedCount: number
  readonly total: number
  readonly filterSelection: () => BulkActionSelection
  readonly clear: () => void
}

export function useBulkSelection({
  selectedIds,
  selectedCount,
  total,
  filterSelection,
  clear,
}: BulkSelectionArgs) {
  const [allMatching, setAllMatching] = useState(false)

  useEffect(() => setAllMatching(false), [selectedCount])

  const current = useCallback(
    (): BulkActionSelection => (allMatching ? filterSelection() : idsSelection(selectedIds())),
    [allMatching, filterSelection, selectedIds],
  )

  const reset = useCallback(() => {
    setAllMatching(false)
    clear()
  }, [clear])

  return {
    allMatching,
    selectAll: useCallback(() => setAllMatching(true), []),
    current,
    count: selectionSize(current(), total),
    reset,
  }
}

export type BulkSelection = ReturnType<typeof useBulkSelection>
