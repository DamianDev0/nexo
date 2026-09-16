'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import { invalidateContactRecords } from '@/entities/contact'
import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactConsentInput } from '@repo/shared-types'

export function useSaveContactConsent(contactId: string) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (input: ContactConsentInput) => contactsService.saveConsent(contactId, input),
    onSuccess: (_data, input) => {
      sileo.success({
        title: t(input.granted ? 'contacts.consents.granted' : 'contacts.consents.revoked'),
      })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.consents(contactId) })
      void invalidateContactRecords(client, contactId)
    },
    onError: () => sileo.error({ title: t('common.saveFailed') }),
  })
}
