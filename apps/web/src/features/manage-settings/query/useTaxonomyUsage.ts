'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactTaxonomyUsage, TaxonomyReassignKind } from '@repo/shared-types'

const USAGE_STALE_MS = 60 * 1000

const EMPTY_USAGE: ContactTaxonomyUsage = { statuses: {}, sources: {}, types: {}, tags: {} }

export function useTaxonomyUsage() {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.contacts.taxonomyUsage,
    queryFn: contactsService.taxonomyUsage,
    staleTime: USAGE_STALE_MS,
  })
  return data ?? EMPTY_USAGE
}

export function useReassignTaxonomy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { kind: TaxonomyReassignKind; fromKey: string; toKey: string }) =>
      contactsService.reassignTaxonomy(input),
    onSuccess: ({ reassigned }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      sileo.success({ title: t('settings.reassign.done', { count: reassigned }) })
    },
    onError: (error: { message?: string }) => {
      sileo.error({ title: t('common.saveFailed'), description: error.message })
    },
  })
}
