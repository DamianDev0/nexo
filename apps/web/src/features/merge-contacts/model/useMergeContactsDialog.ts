'use client'

import { useCallback, useMemo, useState } from 'react'

import { buildMergeRows, fillGapsFromLoser, toggleMergeField } from '../lib/merge-fields'
import { useMergeContacts } from '../query/useMergeContacts'

import type { ContactListItem, ContactMergeField } from '@repo/shared-types'

export function useMergeContactsDialog(winner: ContactListItem | null, onMerged?: () => void) {
  const [open, setOpen] = useState(false)
  const [loser, setLoser] = useState<ContactListItem | null>(null)
  const [fields, setFields] = useState<ReadonlyArray<ContactMergeField>>([])
  const { merge, isPending } = useMergeContacts(() => {
    setOpen(false)
    setLoser(null)
    onMerged?.()
  })

  const rows = useMemo(
    () => (winner && loser ? buildMergeRows(winner, loser) : []),
    [winner, loser],
  )

  const pickLoser = useCallback(
    (contact: ContactListItem | null) => {
      setLoser(contact)
      setFields(contact && winner ? fillGapsFromLoser(buildMergeRows(winner, contact)) : [])
    },
    [winner],
  )

  return {
    open,
    loser,
    rows,
    fields,
    isPending,
    ask: useCallback(() => setOpen(true), []),
    close: useCallback(() => {
      setOpen(false)
      setLoser(null)
      setFields([])
    }, []),
    pickLoser,
    toggleField: useCallback(
      (field: ContactMergeField) => setFields((current) => toggleMergeField(current, field)),
      [],
    ),
    confirm: useCallback(() => {
      if (winner && loser) {
        merge({ winnerId: winner.id, loserId: loser.id, fieldsFromLoser: [...fields] })
      }
    }, [merge, winner, loser, fields]),
  }
}

export type MergeContactsDialogState = ReturnType<typeof useMergeContactsDialog>
