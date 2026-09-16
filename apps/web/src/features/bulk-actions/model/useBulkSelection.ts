'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { idsSelection, selectionSize } from '../lib/bulk-request'

import type { BulkActionSelection } from '@repo/shared-types'

export type BulkPageSelection = {
  readonly selected: boolean
  readonly select: () => void
}

type BulkSelectionArgs = {
  readonly selectedIds: () => string[]
  readonly selectedCount: number
  readonly total: number
  readonly page: BulkPageSelection
  readonly filterSelection: () => BulkActionSelection
  readonly clear: () => void
}

export function useBulkSelection({
  selectedIds,
  selectedCount,
  total,
  page,
  filterSelection,
  clear,
}: BulkSelectionArgs) {
  const [allMatching, setAllMatching] = useState(false)
  const lastCount = useRef(selectedCount)
  const ownCountChange = useRef(false)

  const { selected: pageSelected, select: selectPage } = page
  useEffect(() => {
    const countChanged = selectedCount !== lastCount.current
    lastCount.current = selectedCount
    if (countChanged) {
      if (ownCountChange.current) ownCountChange.current = false
      else setAllMatching(false)
      return
    }
    if (!allMatching || pageSelected) return
    ownCountChange.current = true
    selectPage()
  }, [selectedCount, allMatching, pageSelected, selectPage])

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
