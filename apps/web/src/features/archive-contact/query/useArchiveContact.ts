'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import { useEntityTerms } from '@/entities/nomenclature'
import contactsService from '@/shared/api/services/contacts.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

export function useArchiveContact(onArchived?: () => void) {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const client = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => contactsService.archive(id),
    onSuccess: () => {
      sileo.success({ title: t('contacts.archive.done', { entity: terms.singular }) })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      onArchived?.()
    },
    onError: (error: { message?: string }) => notifySaveFailed(error),
  })

  return {
    archive: useCallback((contactId: string) => mutate(contactId), [mutate]),
    isPending,
  }
}
