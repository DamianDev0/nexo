'use client'

import { useMemo } from 'react'

import { useRestoreRecord } from '@/features/archive-record'
import {
  useAssignRecordOwner,
  useChangeRecordStatus,
  useEditRecordCustomFields,
  useEditRecordFields,
} from '@/features/edit-record-field'
import { useToggleContactActivity } from '@/features/log-contact-activity'
import { useDialNumber } from '@/features/place-call'
import { copyToClipboard } from '@/shared/lib/copy-to-clipboard'

import type {
  ContactComposeChannel,
  ContactFieldsPatch,
  ContactLogKind,
  ContactRowActions,
} from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

type RowActionHandlers = {
  readonly onArchive: (contact: ContactListItem) => void
  readonly onViewRecord: (contact: ContactListItem) => void
  readonly onOpen: (contact: ContactListItem) => void
  readonly onPreview: (contact: ContactListItem) => void
  readonly onAddNote: (contact: ContactListItem) => void
  readonly onEditTags: (contact: ContactListItem) => void
  readonly onCompose: (channel: ContactComposeChannel, contact: ContactListItem) => void
  readonly onLogActivity: (kind: ContactLogKind, contact: ContactListItem) => void
}

export function useContactRowActions(handlers: RowActionHandlers): ContactRowActions {
  const changeStatus = useChangeRecordStatus()
  const editCustomFields = useEditRecordCustomFields()
  const editFields = useEditRecordFields<ContactFieldsPatch>()
  const dialNumber = useDialNumber()
  const restore = useRestoreRecord()
  const assignOwner = useAssignRecordOwner()
  const toggleActivity = useToggleContactActivity()
  const {
    onArchive,
    onViewRecord,
    onOpen,
    onPreview,
    onAddNote,
    onEditTags,
    onCompose,
    onLogActivity,
  } = handlers

  return useMemo(
    () => ({
      onArchive,
      onViewRecord,
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
      onToggleActivity: toggleActivity,
    }),
    [
      onArchive,
      onViewRecord,
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
      toggleActivity,
    ],
  )
}
