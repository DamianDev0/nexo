'use client'

import { useCallback } from 'react'

import type { useDataTable } from '@/shared/ui/organisms/data-table'
import type { ContactListItem } from '@repo/shared-types'

type BoardSelectionArgs = {
  readonly instance: ReturnType<typeof useDataTable<ContactListItem>>
  readonly archive: (ids: string[]) => void
  readonly closePreview: () => void
  readonly openEdit: (contact: ContactListItem) => void
}

export function useBoardSelection({
  instance,
  archive,
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

  const archiveSelected = useCallback(() => {
    const ids = instance.table.getSelectedRowModel().rows.map((row) => row.id)
    if (ids.length === 0) return
    instance.table.resetRowSelection()
    archive(ids)
  }, [instance.table, archive])

  return { openFromPreview, archiveSelected }
}
