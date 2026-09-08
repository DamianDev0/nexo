'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback } from 'react'
import { sileo } from 'sileo'

import { QUERY_KEYS } from '@/shared/query/query-keys'

import { usePendingContactPatches } from '../model/contact-pending.store'

import type { ContactListItem, PaginatedContacts } from '@repo/shared-types'

type ContactKey = keyof ContactListItem

type Reversal = {
  readonly id: string
  readonly previous: ContactListItem
  readonly keys: ReadonlyArray<ContactKey>
}

type OptimisticContactListPatchOptions<TChange> = {
  mutationFn: (change: TChange) => Promise<unknown>
  patch: (contact: ContactListItem, change: TChange) => ContactListItem
  match: (contact: ContactListItem, change: TChange) => boolean
  successTitle: () => string
}

const contactLists = QUERY_KEYS.contacts.lists
const CONTACT_LIST_SCOPE = { id: 'contact-list-patch' }

function changedKeys(previous: ContactListItem, next: ContactListItem): ReadonlyArray<ContactKey> {
  return (Object.keys(next) as ContactKey[]).filter((key) => next[key] !== previous[key])
}

function revertOwnKeys(contact: ContactListItem, reversal: Reversal): ContactListItem {
  const restored = { ...contact }
  for (const key of reversal.keys) Object.assign(restored, { [key]: reversal.previous[key] })
  return restored
}

export function useOptimisticContactListPatch<TChange>({
  mutationFn,
  patch,
  match,
  successTitle,
}: OptimisticContactListPatchOptions<TChange>) {
  const client = useQueryClient()

  const { mutate } = useMutation({
    mutationFn,
    scope: CONTACT_LIST_SCOPE,
    onMutate: async (change: TChange): Promise<{ reversals: Reversal[] }> => {
      await client.cancelQueries({ queryKey: contactLists })
      const reversals: Reversal[] = []
      client.setQueriesData<PaginatedContacts>({ queryKey: contactLists }, (page) =>
        page
          ? {
              ...page,
              data: page.data.map((contact) => {
                if (!match(contact, change)) return contact
                const next = patch(contact, change)
                reversals.push({
                  id: contact.id,
                  previous: contact,
                  keys: changedKeys(contact, next),
                })
                return next
              }),
            }
          : page,
      )
      usePendingContactPatches.getState().begin(reversals.map((reversal) => reversal.id))
      return { reversals }
    },
    onSuccess: () => sileo.success({ title: successTitle() }),
    onError: (_error, _change, context) => {
      const byId = new Map(context?.reversals.map((reversal) => [reversal.id, reversal]))
      client.setQueriesData<PaginatedContacts>({ queryKey: contactLists }, (page) =>
        page
          ? {
              ...page,
              data: page.data.map((contact) => {
                const reversal = byId.get(contact.id)
                return reversal ? revertOwnKeys(contact, reversal) : contact
              }),
            }
          : page,
      )
      sileo.error({ title: t('common.saveFailed') })
    },
    onSettled: (_data, _error, _change, context) => {
      usePendingContactPatches.getState().end(context?.reversals.map((r) => r.id) ?? [])
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
    },
  })

  return useCallback((change: TChange) => mutate(change), [mutate])
}
