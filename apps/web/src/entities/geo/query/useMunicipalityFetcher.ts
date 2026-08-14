'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import geoService from '@/shared/api/services/geo.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { Municipality } from '@repo/shared-types'

const MIN_TERM_LENGTH = 2
const STALE_MS = 60 * 60 * 1000

export function useMunicipalityFetcher(department?: string) {
  const queryClient = useQueryClient()

  return useCallback(
    async (query: string): Promise<ReadonlyArray<Municipality>> => {
      const trimmed = query.trim()
      if (trimmed.length < MIN_TERM_LENGTH) return []

      return queryClient.fetchQuery({
        queryKey: QUERY_KEYS.geo.municipalities(trimmed, department),
        queryFn: () => geoService.searchMunicipalities(trimmed, department),
        staleTime: STALE_MS,
        retry: false,
      })
    },
    [queryClient, department],
  )
}
