import { TAXONOMY_KEY_PATTERN } from '@repo/shared-types'

import {
  EMPTY_QUICK_FILTERS,
  QUICK_FILTER_ICONS,
  QUICK_FILTER_IDS,
  type QuickFilterId,
  type QuickFilterState,
} from '../config/quick-filters.constants'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { QuickFilterDef } from '@/shared/ui/organisms/data-table'
import type { TFunction } from 'i18next'

function isQuickFilterId(value: string): value is QuickFilterId {
  return (QUICK_FILTER_IDS as ReadonlyArray<string>).includes(value)
}

function isAllowed(_id: QuickFilterId, value: string): boolean {
  return TAXONOMY_KEY_PATTERN.test(value)
}

export function parseQuickFilters(
  read: (key: string) => string | null | undefined,
): QuickFilterState {
  const state: Record<QuickFilterId, ReadonlyArray<string>> = { ...EMPTY_QUICK_FILTERS }

  for (const id of QUICK_FILTER_IDS) {
    const raw = read(id)
    state[id] = raw ? raw.split(',').filter((value) => isAllowed(id, value)) : []
  }

  return state
}

export function toggleQuickFilter(
  state: QuickFilterState,
  filterId: string,
  value: string,
): QuickFilterState {
  if (!isQuickFilterId(filterId)) return state
  const next = state[filterId].includes(value) ? [] : [value]
  return { ...state, [filterId]: next }
}

export function clearQuickFilters(state: QuickFilterState, filterId?: string): QuickFilterState {
  if (!filterId) return EMPTY_QUICK_FILTERS
  if (!isQuickFilterId(filterId)) return state
  return { ...state, [filterId]: [] }
}

export function hasQuickFilters(state: QuickFilterState): boolean {
  return QUICK_FILTER_IDS.some((id) => state[id].length > 0)
}

export function buildQuickFilterDefs(
  t: TFunction,
  state: QuickFilterState,
  choices: {
    sources: ReadonlyArray<TaxonomyChoice>
    lifecycleStages: ReadonlyArray<TaxonomyChoice>
  },
  entity = '',
): ReadonlyArray<QuickFilterDef> {
  return QUICK_FILTER_IDS.map((id) => ({
    id,
    label: t(`contacts.filters.${id}`),
    selected: state[id],
    options: (id === 'source' ? choices.sources : choices.lifecycleStages).map((choice) => ({
      value: choice.key,
      label: choice.label,
      hint:
        choice.description ??
        (t(`common.filters.hints.${id}.${choice.key}`, { defaultValue: '', entity }) || undefined),
      icon: QUICK_FILTER_ICONS[id],
    })),
  }))
}
