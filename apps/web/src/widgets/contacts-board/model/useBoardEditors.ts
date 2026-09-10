'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useCreateFromUrl } from '@/features/create-contact'
import { ROUTES } from '@/shared/config/routes'
import { useEntityEditor } from '@/shared/lib/hooks/useEntityEditor'

import { useContactComposers } from './useContactComposers'
import { useContactRowActions } from './useContactRowActions'

import type { ContactListItem } from '@repo/shared-types'

export function useBoardEditors() {
  const sheet = useEntityEditor<ContactListItem>()
  const preview = useEntityEditor<ContactListItem>()
  const composers = useContactComposers()
  const router = useRouter()
  useCreateFromUrl(sheet.openCreate)

  const viewRecord = useCallback(
    (contact: ContactListItem) => router.push(ROUTES.app.contacts.detail(contact.id)),
    [router],
  )

  const rowActions = useContactRowActions({
    onViewRecord: viewRecord,
    onOpen: sheet.openEdit,
    onPreview: preview.openEdit,
    onAddNote: composers.openNote,
    onEditTags: composers.openTags,
    onCompose: composers.openMessage,
    onLogActivity: composers.openActivity,
  })

  return { sheet, preview, composers, rowActions, viewRecord }
}
