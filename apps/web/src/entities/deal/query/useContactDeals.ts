'use client'

import { useQuery } from '@tanstack/react-query'

import dealsService from '@/shared/api/services/deals.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { sortDealsForRecord } from '../lib/deal-display'

import type { DealListItem } from '@repo/shared-types'

const DEALS_LIMIT = 50
const DEALS_STALE_MS = 30_000
const NO_DEALS: ReadonlyArray<DealListItem> = []

export function useContactDeals(contactId: string) {
  const { data, isPending, isError } = useQuery({
    queryKey: QUERY_KEYS.deals.byContact(contactId),
    queryFn: () => dealsService.list({ contactId, limit: DEALS_LIMIT }),
    select: (page) => sortDealsForRecord(page.data),
    staleTime: DEALS_STALE_MS,
  })

  return {
    deals: data ?? NO_DEALS,
    isLoading: isPending,
    isError,
  }
}

export type ContactDealsFeed = ReturnType<typeof useContactDeals>
