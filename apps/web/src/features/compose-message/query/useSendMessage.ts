'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import messagingService from '@/shared/api/services/messaging.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { SendMessageInput } from '@repo/shared-types'

export function useSendMessage() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (payload: SendMessageInput) => messagingService.send(payload),
    onSuccess: (message, payload) => {
      sileo.success({
        title: t('contacts.composers.message.sent'),
        description: message.toNumber,
      })
      if (payload.contactId) {
        void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.timeline(payload.contactId) })
      }
    },
    onError: () => sileo.error({ title: t('contacts.composers.message.sendFailed') }),
  })
}
