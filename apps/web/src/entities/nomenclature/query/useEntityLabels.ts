'use client'

import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { TenantNomenclature } from '@repo/shared-types'

export type EntityKey = keyof TenantNomenclature
export type EntityForm = 'singular' | 'plural'

const NOMENCLATURE_STALE_MS = 5 * 60 * 1000

export function useEntityLabels() {
  const { t } = useTranslation()

  const { data } = useQuery({
    queryKey: QUERY_KEYS.settings.nomenclature,
    queryFn: settingsService.getNomenclature,
    staleTime: NOMENCLATURE_STALE_MS,
  })

  return useCallback(
    (entity: EntityKey, form: EntityForm = 'plural'): string =>
      data?.[entity]?.[form] ?? t(`entities.${entity}.${form}`),
    [data, t],
  )
}
