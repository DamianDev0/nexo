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

import type { ContactFieldsPatch, ContactRowActions } from '@/entities/contact'
import type { ArchiveRecordDialogState } from '@/features/archive-record'
import type { ContactComposers } from '@/features/compose-contact-actions'
import type { ContactListItem } from '@repo/shared-types'

export function useContactDetailActions(
  composers: ContactComposers,
  archive: ArchiveRecordDialogState<ContactListItem>,
  onMerge: () => void,
): ContactRowActions {
  const assignOwner = useAssignRecordOwner()
  const changeStatus = useChangeRecordStatus()
  const dialNumber = useDialNumber()
  const editCustomFields = useEditRecordCustomFields()
  const editFields = useEditRecordFields<ContactFieldsPatch>()
  const restore = useRestoreRecord()
  const toggleActivity = useToggleContactActivity()
  const { openNote, openTags, openMessage, openActivity } = composers

  return useMemo(
    () => ({
      onAddNote: openNote,
      onArchive: archive.ask,
      onMerge,
      onAssign: assignOwner,
      onCall: dialNumber,
      onCompose: openMessage,
      onCopy: (value: string) => void copyToClipboard(value),
      onCustomFieldsChange: editCustomFields,
      onEditTags: openTags,
      onFieldsChange: editFields,
      onLogActivity: openActivity,
      onRestore: restore,
      onStatusChange: changeStatus,
      onToggleActivity: toggleActivity,
    }),
    [
      archive.ask,
      onMerge,
      assignOwner,
      changeStatus,
      dialNumber,
      editCustomFields,
      editFields,
      openActivity,
      openMessage,
      openNote,
      openTags,
      restore,
      toggleActivity,
    ],
  )
}
