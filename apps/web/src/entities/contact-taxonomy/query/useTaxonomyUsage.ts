'use client'

import { useQuery } from '@tanstack/react-query'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactTaxonomyUsage } from '@repo/shared-types'

const USAGE_STALE_MS = 60 * 1000

const EMPTY_USAGE: ContactTaxonomyUsage = {
  statuses: {},
  sources: {},
  lifecycleStages: {},
  tags: {},
}

export function useTaxonomyUsage(): ContactTaxonomyUsage {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.contacts.taxonomyUsage,
    queryFn: contactsService.taxonomyUsage,
    staleTime: USAGE_STALE_MS,
  })
  return data ?? EMPTY_USAGE
}
