'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import geoService from '@/shared/api/services/geo.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { extractCityFromPlace, pickMunicipality } from '../lib/place-city'

import type { Municipality } from '@repo/shared-types'

const STALE_MS = 60 * 60 * 1000

export function useResolveMunicipality() {
  const queryClient = useQueryClient()

  return useCallback(
    async (secondaryText: string): Promise<Municipality | null> => {
      const city = extractCityFromPlace(secondaryText)
      if (!city) return null

      const municipalities = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.geo.municipalities(city, undefined),
        queryFn: () => geoService.searchMunicipalities(city),
        staleTime: STALE_MS,
        retry: false,
      })

      return pickMunicipality(city, municipalities)
    },
    [queryClient],
  )
}
