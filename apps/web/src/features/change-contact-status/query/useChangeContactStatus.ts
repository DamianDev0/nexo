'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback } from 'react'
import { sileo } from 'sileo'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { PaginatedContacts } from '@repo/shared-types'
import type { QueryKey } from '@tanstack/react-query'

type StatusChange = { id: string; status: string }

type ListSnapshot = Array<[QueryKey, PaginatedContacts | undefined]>

const contactLists = QUERY_KEYS.contacts.lists

function applyStatus(page: PaginatedContacts | undefined, change: StatusChange) {
  if (!page) return page
  return {
    ...page,
    data: page.data.map((contact) =>
      contact.id === change.id
        ? { ...contact, status: change.status, statusChangedAt: new Date().toISOString() }
        : contact,
    ),
  }
}

export function useChangeContactStatus() {
  const client = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: ({ id, status }: StatusChange) => contactsService.update(id, { status }),
    onMutate: async (change): Promise<{ snapshots: ListSnapshot }> => {
      await client.cancelQueries({ queryKey: contactLists })
      const snapshots = client.getQueriesData<PaginatedContacts>({ queryKey: contactLists })
      client.setQueriesData<PaginatedContacts>({ queryKey: contactLists }, (page) =>
        applyStatus(page, change),
      )
      return { snapshots }
    },
    onSuccess: () => sileo.success({ title: t('contacts.toasts.statusUpdated') }),
    onError: (_error, _change, context) => {
      context?.snapshots.forEach(([key, data]) => client.setQueryData(key, data))
      sileo.error({ title: t('common.saveFailed') })
    },
    onSettled: () => void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all }),
  })

  return useCallback((id: string, status: string) => mutate({ id, status }), [mutate])
}
