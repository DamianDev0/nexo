'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import geoService from '@/shared/api/services/geo.service'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { Municipality } from '@repo/shared-types'

const MIN_TERM_LENGTH = 2
const STALE_MS = 60 * 60 * 1000

export function useMunicipalitySearch(term: string, department?: string) {
  const debounced = useDebouncedValue(term)
  const enabled = debounced.trim().length >= MIN_TERM_LENGTH

  const { data, isFetching } = useQuery({
    queryKey: QUERY_KEYS.geo.municipalities(debounced, department),
    queryFn: () => geoService.searchMunicipalities(debounced, department),
    enabled,
    staleTime: STALE_MS,
    placeholderData: keepPreviousData,
  })

  return {
    municipalities: (data ?? []) as ReadonlyArray<Municipality>,
    isSearching: enabled && isFetching,
    isIdle: !enabled,
  }
}
