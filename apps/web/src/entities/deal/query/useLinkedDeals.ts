'use client'

import { useQuery } from '@tanstack/react-query'

import dealsService from '@/shared/api/services/deals.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { sortDealsForRecord } from '../lib/deal-display'

import type { DealListItem } from '@repo/shared-types'

const DEALS_LIMIT = 50
const DEALS_STALE_MS = 30_000
const NO_DEALS: ReadonlyArray<DealListItem> = []
const NO_LINK = {}

type DealLink = { readonly contactId?: string; readonly companyId?: string }

export function useLinkedDeals(link: DealLink | null) {
  const { data, isPending, isError } = useQuery({
    queryKey: QUERY_KEYS.deals.linked(link ?? NO_LINK),
    queryFn: () => dealsService.list({ ...link, limit: DEALS_LIMIT }),
    select: (page) => sortDealsForRecord(page.data),
    staleTime: DEALS_STALE_MS,
    enabled: link !== null,
  })

  return {
    deals: data ?? NO_DEALS,
    isLoading: link !== null && isPending,
    isError,
  }
}

export type LinkedDealsFeed = ReturnType<typeof useLinkedDeals>
