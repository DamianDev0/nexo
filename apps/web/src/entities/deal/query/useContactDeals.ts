'use client'

import { useQuery } from '@tanstack/react-query'

import dealsService from '@/shared/api/services/deals.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { sortDealsForRecord } from '../lib/deal-display'

const DEALS_LIMIT = 50
const DEALS_STALE_MS = 30_000

export function useContactDeals(contactId: string) {
  const { data, isPending, isError } = useQuery({
    queryKey: QUERY_KEYS.deals.byContact(contactId),
    queryFn: () => dealsService.list({ contactId, limit: DEALS_LIMIT }),
    staleTime: DEALS_STALE_MS,
  })

  return {
    deals: sortDealsForRecord(data?.data ?? []),
    isLoading: isPending,
    isError,
  }
}

export type ContactDealsFeed = ReturnType<typeof useContactDeals>
