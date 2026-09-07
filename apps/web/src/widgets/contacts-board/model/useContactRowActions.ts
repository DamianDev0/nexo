'use client'

import { useMemo } from 'react'

import { useRestoreContact } from '@/entities/contact'
import { useAssignContactOwner } from '@/features/assign-contact-owner'
import { useChangeContactStatus } from '@/features/change-contact-status'
import { useEditContactCustomFields, useEditContactFields } from '@/features/edit-contact-field'
import { useDialNumber } from '@/features/place-call'
import { copyToClipboard } from '@/shared/lib/copy-to-clipboard'

import type { ContactComposeChannel, ContactLogKind, ContactRowActions } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

type RowActionHandlers = {
  readonly onOpen: (contact: ContactListItem) => void
  readonly onPreview: (contact: ContactListItem) => void
  readonly onAddNote: (contact: ContactListItem) => void
  readonly onEditTags: (contact: ContactListItem) => void
  readonly onCompose: (channel: ContactComposeChannel, contact: ContactListItem) => void
  readonly onLogActivity: (kind: ContactLogKind, contact: ContactListItem) => void
}

export function useContactRowActions(handlers: RowActionHandlers): ContactRowActions {
  const changeStatus = useChangeContactStatus()
  const editCustomFields = useEditContactCustomFields()
  const editFields = useEditContactFields()
  const dialNumber = useDialNumber()
  const restore = useRestoreContact()
  const assignOwner = useAssignContactOwner()
  const { onOpen, onPreview, onAddNote, onEditTags, onCompose, onLogActivity } = handlers

  return useMemo(
    () => ({
      onOpen,
      onPreview,
      onAddNote,
      onEditTags,
      onCompose,
      onLogActivity,
      onRestore: restore,
      onAssign: assignOwner,
      onFieldsChange: editFields,
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
      onLogActivity,
      dialNumber,
      restore,
      assignOwner,
      editFields,
      changeStatus,
      editCustomFields,
    ],
  )
}
