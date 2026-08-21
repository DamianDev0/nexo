'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { TaxonomyChoice } from '../model/types/taxonomy.types'
import type { TaxonomyOption } from '@repo/shared-types'
import type { TFunction } from 'i18next'

const STALE_MS = 5 * 60 * 1000

function toChoices(
  t: TFunction,
  options: ReadonlyArray<TaxonomyOption> = [],
  namespace: 'status' | 'source' | 'types' | 'lifecycleStage',
): TaxonomyChoice[] {
  return options
    .filter((option) => option.enabled)
    .sort((a, b) => a.order - b.order)
    .map((option) => ({
      key: option.key,
      color: option.color,
      label: option.label ?? t(`contacts.${namespace}.${option.key}`, { defaultValue: option.key }),
    }))
}

function byKey(choices: ReadonlyArray<TaxonomyChoice>): ReadonlyMap<string, TaxonomyChoice> {
  return new Map(choices.map((choice) => [choice.key, choice]))
}

export function useContactTaxonomy() {
  const { t } = useTranslation()

  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.settings.contactTaxonomy,
    queryFn: settingsService.getContactTaxonomy,
    staleTime: STALE_MS,
  })

  return useMemo(() => {
    const statuses = toChoices(t, data?.statuses, 'status')
    const sources = toChoices(t, data?.sources, 'source')
    const types = toChoices(t, data?.types, 'types')
    const lifecycleStages = toChoices(t, data?.lifecycleStages, 'lifecycleStage')
    return {
      statuses,
      sources,
      types,
      lifecycleStages,
      statusByKey: byKey(statuses),
      sourceByKey: byKey(sources),
      typeByKey: byKey(types),
      lifecycleByKey: byKey(lifecycleStages),
      isPending,
    }
  }, [t, data, isPending])
}
