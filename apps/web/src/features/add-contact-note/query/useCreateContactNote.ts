'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import activitiesService from '@/shared/api/services/activities.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { CreateActivityInput } from '@/shared/api/services/activities.service'

export function useCreateContactNote() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateActivityInput) => activitiesService.create(payload),
    onSuccess: (_data, payload) => {
      sileo.success({
        title: t('contacts.composers.note.saved'),
        description: payload.title,
      })
      if (payload.contactId) {
        const queryKey = QUERY_KEYS.contacts.timeline(payload.contactId)
        void client.invalidateQueries({ queryKey })
      }
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.lists })
    },
    onError: () => sileo.error({ title: t('common.saveFailed') }),
  })
}
