'use client'

import { useCallback, useEffect, useRef } from 'react'

import { collectTags } from '../lib/selection-scope'

import type { useDataTable } from '@/shared/ui/organisms/data-table'
import type { ContactListItem } from '@repo/shared-types'

type BoardSelectionArgs = {
  readonly instance: ReturnType<typeof useDataTable<ContactListItem>>
  readonly scopeKey: string
  readonly closePreview: () => void
  readonly openEdit: (contact: ContactListItem) => void
}

export function useBoardSelection({
  instance,
  scopeKey,
  closePreview,
  openEdit,
}: BoardSelectionArgs) {
  const openFromPreview = useCallback(
    (contact: ContactListItem) => {
      closePreview()
      openEdit(contact)
    },
    [closePreview, openEdit],
  )

  const { table, selection } = instance
  const seen = useRef(new Map<string, ContactListItem>())

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
