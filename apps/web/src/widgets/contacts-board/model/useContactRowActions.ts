'use client'

import { useMemo } from 'react'

import { useChangeContactStatus } from '@/features/change-contact-status'
import { copyToClipboard } from '@/shared/lib/copy-to-clipboard'

import type { ContactRowActions } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

type RowActionHandlers = {
  readonly onOpen: (contact: ContactListItem) => void
  readonly onPreview: (contact: ContactListItem) => void
}

export function useContactRowActions(handlers: RowActionHandlers): ContactRowActions {
  const changeStatus = useChangeContactStatus()
  const { onOpen, onPreview } = handlers

  return useMemo(
    () => ({
      onOpen,
      onPreview,
      onCopy: (value: string) => void copyToClipboard(value),
      onStatusChange: changeStatus,
    }),
    [onOpen, onPreview, changeStatus],
  )
}
