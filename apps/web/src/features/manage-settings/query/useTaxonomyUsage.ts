'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import { useEntityTerms } from '@/entities/nomenclature'
import contactsService from '@/shared/api/services/contacts.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { TaxonomyReassignKind } from '@repo/shared-types'

export { useTaxonomyUsage } from '@/entities/contact-taxonomy'

export function useReassignTaxonomy() {
  const queryClient = useQueryClient()
  const terms = useEntityTerms('contact')

  return useMutation({
    mutationFn: (input: { kind: TaxonomyReassignKind; fromKey: string; toKey: string }) =>
      contactsService.reassignTaxonomy(input),
    onSuccess: ({ reassigned }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      sileo.success({
        title: t('settings.reassign.done', { count: reassigned, entities: terms.lowerPlural }),
      })
    },
    onError: (error: { message?: string }) => notifySaveFailed(error),
  })
}
