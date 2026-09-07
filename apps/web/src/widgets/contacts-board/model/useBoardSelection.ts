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

  const selectedRows = useCallback(
    () => instance.table.getSelectedRowModel().rows.map((row) => row.original),
    [instance.table],
  )

  const selectedIds = useCallback(() => selectedRows().map((row) => row.id), [selectedRows])
  const selectedTags = useCallback(() => collectTags(selectedRows()), [selectedRows])
  const clearSelection = useCallback(() => instance.table.resetRowSelection(), [instance.table])

  const previousScope = useRef(scopeKey)
  useEffect(() => {
    if (previousScope.current === scopeKey) return
    previousScope.current = scopeKey
    clearSelection()
    closePreview()
  }, [scopeKey, clearSelection, closePreview])

  return { openFromPreview, selectedIds, selectedTags, clearSelection }
}
