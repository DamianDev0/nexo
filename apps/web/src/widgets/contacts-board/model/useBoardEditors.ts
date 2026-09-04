'use client'

import { useCreateFromUrl } from '@/features/create-contact'
import { useEntityEditor } from '@/shared/lib/hooks/useEntityEditor'

import { useContactComposers } from './useContactComposers'
import { useContactRowActions } from './useContactRowActions'

import type { ContactListItem } from '@repo/shared-types'

export function useBoardEditors() {
  const sheet = useEntityEditor<ContactListItem>()
  const preview = useEntityEditor<ContactListItem>()
  const composers = useContactComposers()
  useCreateFromUrl(sheet.openCreate)

  const rowActions = useContactRowActions({
    onOpen: sheet.openEdit,
    onPreview: preview.openEdit,
    onAddNote: composers.openNote,
    onEditTags: composers.openTags,
    onCompose: composers.openMessage,
  })

  return { sheet, preview, composers, rowActions }
}
