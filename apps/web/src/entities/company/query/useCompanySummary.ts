'use client'

import { useQuery } from '@tanstack/react-query'

import companiesService from '@/shared/api/services/companies.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

const COMPANY_STALE_MS = 60_000

export function useCompanySummary(companyId: string | null) {
  const { data, isPending, isError } = useQuery({
    queryKey: QUERY_KEYS.companies.summary(companyId ?? 'none'),
    queryFn: () => companiesService.summary(companyId ?? ''),
    enabled: companyId !== null,
    staleTime: COMPANY_STALE_MS,
  })

  return {
    company: data ?? null,
    isLoading: companyId !== null && isPending,
    isError,
  }
}
