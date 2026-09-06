'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import { useEntityTerms } from '@/entities/nomenclature'
import contactsService from '@/shared/api/services/contacts.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactListItem } from '@repo/shared-types'

export function useRestoreContact() {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const client = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => contactsService.restore(id),
    onSuccess: () => {
      sileo.success({ title: t('contacts.toasts.restored', { entity: terms.singular }) })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
    },
    onError: (error: { message?: string }) => notifySaveFailed(error),
  })

  const { mutate } = mutation
  return useCallback((contact: ContactListItem) => mutate(contact.id), [mutate])
}
