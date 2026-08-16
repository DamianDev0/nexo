'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback } from 'react'
import { sileo } from 'sileo'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

export function useChangeContactStatus() {
  const client = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      contactsService.update(id, { status }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      sileo.success({ title: t('contacts.toasts.statusUpdated') })
    },
    onError: () => sileo.error({ title: t('common.saveFailed') }),
  })

  return useCallback((id: string, status: string) => mutate({ id, status }), [mutate])
}
