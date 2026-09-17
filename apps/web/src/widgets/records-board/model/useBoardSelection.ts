'use client'

import { useCallback, useEffect, useRef } from 'react'

import { collectTags } from '../lib/collect-tags'

import type { RecordBase } from '@/entities/object-descriptor'
import type { useDataTable } from '@/shared/ui/organisms/data-table'

type SelectableRecord = RecordBase & { readonly tags?: ReadonlyArray<string> }

type BoardSelectionArgs<TRecord extends SelectableRecord> = {
  readonly instance: ReturnType<typeof useDataTable<TRecord>>
  readonly scopeKey: string
  readonly closePreview: () => void
  readonly openEdit: (record: TRecord) => void
}

export function useBoardSelection<TRecord extends SelectableRecord>({
  instance,
  scopeKey,
  closePreview,
  openEdit,
}: BoardSelectionArgs<TRecord>) {
  const openFromPreview = useCallback(
    (record: TRecord) => {
      closePreview()
      openEdit(record)
    },
    [closePreview, openEdit],
  )

  const { table, selection } = instance
  const seen = useRef(new Map<string, TRecord>())

  useEffect(() => {
    for (const row of table.getSelectedRowModel().rows)
      seen.current.set(row.original.id, row.original)
  }, [table, selection.ids])

  const selectedIds = useCallback(() => [...selection.ids], [selection.ids])
  const selectedTags = useCallback(
    () =>
      collectTags(
        selection.ids.flatMap((id) => {
          const row = seen.current.get(id)
          return row ? [row] : []
        }),
      ),
    [selection.ids],
  )
  const clearSelection = useCallback(() => {
    seen.current.clear()
    table.resetRowSelection()
  }, [table])

  const selectPage = useCallback(() => table.toggleAllPageRowsSelected(true), [table])
  const bulkRows = {
    selectedIds,
    selectedTags,
    selectedCount: selection.count,
    page: { selected: table.getIsAllPageRowsSelected(), select: selectPage },
    clear: clearSelection,
  }

  const previousScope = useRef(scopeKey)
  useEffect(() => {
    if (previousScope.current === scopeKey) return
    previousScope.current = scopeKey
    clearSelection()
    closePreview()
  }, [scopeKey, clearSelection, closePreview])

  return { openFromPreview, bulkRows, clearSelection }
}
