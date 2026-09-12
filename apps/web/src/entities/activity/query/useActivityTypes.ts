'use client'

import { useQuery } from '@tanstack/react-query'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ActivityTypeDef } from '@repo/shared-types'

const CATALOG_STALE_MS = 5 * 60 * 1000
const EMPTY: ReadonlyArray<ActivityTypeDef> = []

export function useActivityTypes(): ReadonlyArray<ActivityTypeDef> {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.settings.activityTypes,
    queryFn: () => settingsService.getActivityTypes(),
    staleTime: CATALOG_STALE_MS,
  })

  return data ?? EMPTY
}
