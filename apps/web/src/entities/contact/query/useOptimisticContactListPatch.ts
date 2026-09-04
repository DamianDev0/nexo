'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback } from 'react'
import { sileo } from 'sileo'

import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactListItem, PaginatedContacts } from '@repo/shared-types'
import type { QueryKey } from '@tanstack/react-query'

type ListSnapshot = Array<[QueryKey, PaginatedContacts | undefined]>

type OptimisticContactListPatchOptions<TChange> = {
  mutationFn: (change: TChange) => Promise<unknown>
  patch: (contact: ContactListItem, change: TChange) => ContactListItem
  match: (contact: ContactListItem, change: TChange) => boolean
  successTitle: () => string
}

const contactLists = QUERY_KEYS.contacts.lists

export function useOptimisticContactListPatch<TChange>({
  mutationFn,
  patch,
  match,
  successTitle,
}: OptimisticContactListPatchOptions<TChange>) {
  const client = useQueryClient()

  const { mutate } = useMutation({
    mutationFn,
    onMutate: async (change: TChange): Promise<{ snapshots: ListSnapshot }> => {
      await client.cancelQueries({ queryKey: contactLists })
      const snapshots = client.getQueriesData<PaginatedContacts>({ queryKey: contactLists })
      client.setQueriesData<PaginatedContacts>({ queryKey: contactLists }, (page) =>
        page
          ? {
              ...page,
              data: page.data.map((contact) =>
                match(contact, change) ? patch(contact, change) : contact,
              ),
            }
          : page,
      )
      return { snapshots }
    },
    onSuccess: () => sileo.success({ title: successTitle() }),
    onError: (_error, _change, context) => {
      context?.snapshots.forEach(([key, data]) => client.setQueryData(key, data))
      sileo.error({ title: t('common.saveFailed') })
    },
    onSettled: () => void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all }),
  })

  return useCallback((change: TChange) => mutate(change), [mutate])
}
