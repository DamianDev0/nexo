'use client'

import { useCallback, useMemo, useState } from 'react'

import type { ContactComposeChannel } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

export type ComposerKind = 'note' | 'tags' | ContactComposeChannel

export type ActiveComposer = {
  readonly kind: ComposerKind
  readonly contact: ContactListItem
}

export function useContactComposers() {
  const [active, setActive] = useState<ActiveComposer | null>(null)

  const close = useCallback(() => setActive(null), [])
  const openNote = useCallback(
    (contact: ContactListItem) => setActive({ kind: 'note', contact }),
    [],
  )
  const openTags = useCallback(
    (contact: ContactListItem) => setActive({ kind: 'tags', contact }),
    [],
  )
  const openMessage = useCallback(
    (channel: ContactComposeChannel, contact: ContactListItem) =>
      setActive({ kind: channel, contact }),
    [],
  )

  return useMemo(
    () => ({ active, close, openNote, openTags, openMessage }),
    [active, close, openNote, openTags, openMessage],
  )
}

export type ContactComposers = ReturnType<typeof useContactComposers>
