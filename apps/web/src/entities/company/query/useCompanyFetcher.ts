'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import companiesService from '@/shared/api/services/companies.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { CompanyListItem } from '@repo/shared-types'

const SEARCH_LIMIT = 8
const SEARCH_STALE_MS = 60_000

export function useCompanyFetcher() {
  const queryClient = useQueryClient()

  return useCallback(
    async (query: string): Promise<ReadonlyArray<CompanyListItem>> => {
      const term = query.trim()
      const page = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.companies.search(term),
        queryFn: () => companiesService.list({ q: term || undefined, limit: SEARCH_LIMIT }),
        staleTime: SEARCH_STALE_MS,
        retry: false,
      })
      return page.data
    },
    [queryClient],
  )
}
