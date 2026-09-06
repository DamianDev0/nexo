'use client'

import { useCallback } from 'react'

import type { useDataTable } from '@/shared/ui/organisms/data-table'
import type { ContactListItem } from '@repo/shared-types'

type BoardSelectionArgs = {
  readonly instance: ReturnType<typeof useDataTable<ContactListItem>>
  readonly closePreview: () => void
  readonly openEdit: (contact: ContactListItem) => void
}

export function useBoardSelection({ instance, closePreview, openEdit }: BoardSelectionArgs) {
  const openFromPreview = useCallback(
    (contact: ContactListItem) => {
      closePreview()
      openEdit(contact)
    },
    [closePreview, openEdit],
  )

  const selectedIds = useCallback(
    () => instance.table.getSelectedRowModel().rows.map((row) => row.id),
    [instance.table],
  )

  const clearSelection = useCallback(() => instance.table.resetRowSelection(), [instance.table])

  return { openFromPreview, selectedIds, clearSelection }
}
