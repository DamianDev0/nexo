'use client'

import { useMemo } from 'react'

import type { ContactRowActions, ContactTaxonomyMaps } from '@/entities/contact'
import type { useEntityEditor } from '@/shared/lib/hooks/useEntityEditor'
import type { ContactListItem } from '@repo/shared-types'

type BoardPreviewArgs = {
  readonly editor: ReturnType<typeof useEntityEditor<ContactListItem>>
  readonly rowActions: ContactRowActions
  readonly openFromPreview: (contact: ContactListItem) => void
  readonly siblings: ReadonlyArray<ContactListItem>
  readonly taxonomy: ContactTaxonomyMaps
}

export function useBoardPreview({
  editor,
  rowActions,
  openFromPreview,
  siblings,
  taxonomy,
}: BoardPreviewArgs) {
  const actions = useMemo(
    () => ({ ...rowActions, onOpen: openFromPreview }),
    [rowActions, openFromPreview],
  )

  const editingId = editor.editing?.id
  const contact = useMemo(
    () => siblings.find((sibling) => sibling.id === editingId) ?? editor.editing,
    [siblings, editingId, editor.editing],
  )

  return useMemo(
    () => ({
      contact,
      siblings,
      open: editor.open,
      onOpenChange: editor.setOpen,
      onSelect: editor.openEdit,
      actions,
      taxonomy,
    }),
    [contact, editor.open, editor.setOpen, editor.openEdit, siblings, actions, taxonomy],
  )
}
