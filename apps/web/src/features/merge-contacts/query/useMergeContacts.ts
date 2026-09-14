'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import contactsService from '@/shared/api/services/contacts.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactMergeInput } from '@repo/shared-types'

type MergeInput = ContactMergeInput & {
  readonly winnerId: string
}

export function useMergeContacts(onMerged?: () => void) {
  const client = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ({ winnerId, ...data }: MergeInput) => contactsService.merge(winnerId, data),
    onSuccess: async (result) => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      sileo.success({
        title: t('contacts.merge.done'),
        description: t('contacts.merge.moved', { count: result.movedRecords }),
      })
      onMerged?.()
    },
    onError: (error: { message?: string }) => notifySaveFailed(error),
  })

  return { merge: mutate, isPending }
}
