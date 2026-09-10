'use client'

import { useMemo } from 'react'

import { useRestoreContact } from '@/entities/contact'
import { useAssignContactOwner } from '@/features/assign-contact-owner'
import { useChangeContactStatus } from '@/features/change-contact-status'
import { useEditContactCustomFields, useEditContactFields } from '@/features/edit-contact-field'
import { useToggleContactActivity } from '@/features/log-contact-activity'
import { useDialNumber } from '@/features/place-call'
import { copyToClipboard } from '@/shared/lib/copy-to-clipboard'

import type { ContactRowActions } from '@/entities/contact'
import type { ContactComposers } from '@/features/compose-contact-actions'

export function useContactDetailActions(composers: ContactComposers): ContactRowActions {
  const assignOwner = useAssignContactOwner()
  const changeStatus = useChangeContactStatus()
  const dialNumber = useDialNumber()
  const editCustomFields = useEditContactCustomFields()
  const editFields = useEditContactFields()
  const restore = useRestoreContact()
  const toggleActivity = useToggleContactActivity()
  const { openNote, openTags, openMessage, openActivity } = composers

  return useMemo(
    () => ({
      onAddNote: openNote,
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
