'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import geoService from '@/shared/api/services/geo.service'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { AddressSuggestion } from '@repo/shared-types'

const MIN_TERM_LENGTH = 3
const STALE_MS = 5 * 60 * 1000

export function useAddressAutocomplete(term: string, sessionToken: string) {
  const debounced = useDebouncedValue(term)
  const normalized = debounced.trim()
  const enabled = normalized.length >= MIN_TERM_LENGTH

  const { data, isFetching } = useQuery({
    queryKey: QUERY_KEYS.geo.addresses(normalized),
    queryFn: () => geoService.suggestAddresses(normalized, sessionToken),
    enabled,
    staleTime: STALE_MS,
    placeholderData: keepPreviousData,
  })

  return {
    places: (data ?? []) as ReadonlyArray<AddressSuggestion>,
    isSearching: enabled && isFetching,
  }
}
