'use client'

import { useCallback, useState } from 'react'

import { useArchiveContact } from '../query/useArchiveContact'

import type { ContactListItem } from '@repo/shared-types'

export function useArchiveContactDialog(onArchived?: () => void) {
  const [target, setTarget] = useState<ContactListItem | null>(null)
  const { archive, isPending } = useArchiveContact(onArchived)

  const close = useCallback(() => setTarget(null), [])

  const confirm = useCallback(() => {
    if (target) archive(target.id)
    setTarget(null)
  }, [archive, target])

  return {
    target,
    isPending,
    ask: useCallback((contact: ContactListItem) => setTarget(contact), []),
    close,
    confirm,
  }
}

export type ArchiveContactDialogState = ReturnType<typeof useArchiveContactDialog>
