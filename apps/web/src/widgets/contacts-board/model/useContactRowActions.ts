'use client'

import { useMemo } from 'react'

import { useChangeContactStatus } from '@/features/change-contact-status'
import { useEditContactCustomFields } from '@/features/edit-contact-field'
import { useDialNumber } from '@/features/place-call'
import { copyToClipboard } from '@/shared/lib/copy-to-clipboard'

import { useRestoreContact } from '@/entities/contact'

import type { ContactComposeChannel, ContactRowActions } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

type RowActionHandlers = {
  readonly onOpen: (contact: ContactListItem) => void
  readonly onPreview: (contact: ContactListItem) => void
  readonly onAddNote: (contact: ContactListItem) => void
  readonly onEditTags: (contact: ContactListItem) => void
  readonly onCompose: (channel: ContactComposeChannel, contact: ContactListItem) => void
}

export function useContactRowActions(handlers: RowActionHandlers): ContactRowActions {
  const changeStatus = useChangeContactStatus()
  const editCustomFields = useEditContactCustomFields()
  const dialNumber = useDialNumber()
  const restore = useRestoreContact()
  const { onOpen, onPreview, onAddNote, onEditTags, onCompose } = handlers

  return useMemo(
    () => ({
      onOpen,
      onPreview,
      onAddNote,
      onEditTags,
      onCompose,
      onRestore: restore,
      onCall: dialNumber,
      onCopy: (value: string) => void copyToClipboard(value),
      onStatusChange: changeStatus,
      onCustomFieldsChange: editCustomFields,
    }),
    [
      onOpen,
      onPreview,
      onAddNote,
      onEditTags,
      onCompose,
      dialNumber,
      restore,
      changeStatus,
      editCustomFields,
    ],
  )
}
