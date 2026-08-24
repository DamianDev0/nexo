'use client'

import { useQuery } from '@tanstack/react-query'

import authService from '@/shared/api/services/auth.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

const ME_STALE_MS = 5 * 60 * 1000

export function useAuth() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: authService.me,
    retry: false,
    staleTime: ME_STALE_MS,
  })
}
