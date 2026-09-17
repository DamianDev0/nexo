'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { buildContactCellLabels, buildRowMenuItems } from '@/entities/contact'
import { useArchiveRecordDialog } from '@/features/archive-record'
import { useContactComposers } from '@/features/compose-contact-actions'
import { useCreateFromUrl } from '@/features/create-contact'
import { ROUTES } from '@/shared/config/routes'
import { useEntityEditor } from '@/shared/lib/hooks/useEntityEditor'

import { useContactRowActions } from './useContactRowActions'

import type { ContactListItem } from '@repo/shared-types'

export function useBoardEditors() {
  const sheet = useEntityEditor<ContactListItem>()
  const preview = useEntityEditor<ContactListItem>()
  const composers = useContactComposers()
  const archive = useArchiveRecordDialog<ContactListItem>()
  const router = useRouter()
  useCreateFromUrl(sheet.openCreate)

  const viewRecord = useCallback(
    (contact: ContactListItem) => router.push(ROUTES.app.contacts.detail(contact.id)),
    [router],
  )

  const rowActions = useContactRowActions({
    onArchive: archive.ask,
    onViewRecord: viewRecord,
    onOpen: sheet.openEdit,
    onPreview: preview.openEdit,
    onAddNote: composers.openNote,
    onEditTags: composers.openTags,
    onCompose: composers.openMessage,
    onLogActivity: composers.openActivity,
  })

  const { t } = useTranslation()
  const rowContextMenu = useCallback(
    (contact: ContactListItem) =>
      buildRowMenuItems(contact, buildContactCellLabels(t).name, rowActions),
    [t, rowActions],
  )

  return { sheet, preview, composers, archive, rowActions, rowContextMenu, viewRecord }
}
