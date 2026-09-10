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

export function useContactDetailActions(): ContactRowActions {
  const assignOwner = useAssignContactOwner()
  const changeStatus = useChangeContactStatus()
  const dialNumber = useDialNumber()
  const editCustomFields = useEditContactCustomFields()
  const editFields = useEditContactFields()
  const restore = useRestoreContact()
  const toggleActivity = useToggleContactActivity()

  return useMemo(
    () => ({
      onAssign: assignOwner,
      onCall: dialNumber,
      onCopy: (value: string) => void copyToClipboard(value),
      onCustomFieldsChange: editCustomFields,
      onFieldsChange: editFields,
      onRestore: restore,
      onStatusChange: changeStatus,
      onToggleActivity: toggleActivity,
    }),
    [assignOwner, changeStatus, dialNumber, editCustomFields, editFields, restore, toggleActivity],
  )
}
