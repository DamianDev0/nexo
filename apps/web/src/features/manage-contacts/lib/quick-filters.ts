import {
  EMPTY_QUICK_FILTERS,
  QUICK_FILTER_ICONS,
  QUICK_FILTER_IDS,
  QUICK_FILTER_OPTIONS,
  type QuickFilterId,
  type QuickFilterState,
} from '../config/quick-filters.constants'

import type { QuickFilterDef } from '@/shared/ui/organisms/data-table'
import type { TFunction } from 'i18next'

function isQuickFilterId(value: string): value is QuickFilterId {
  return (QUICK_FILTER_IDS as ReadonlyArray<string>).includes(value)
}

export function parseQuickFilters(
  read: (key: string) => string | null | undefined,
): QuickFilterState {
  const state: Record<QuickFilterId, ReadonlyArray<string>> = { ...EMPTY_QUICK_FILTERS }

  for (const id of QUICK_FILTER_IDS) {
    const raw = read(id)
    const allowed = new Set(QUICK_FILTER_OPTIONS[id])
    state[id] = raw ? raw.split(',').filter((value) => allowed.has(value)) : []
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
): ReadonlyArray<QuickFilterDef> {
  return QUICK_FILTER_IDS.map((id) => ({
    id,
    label: t(`contacts.filters.${id}`),
    selected: state[id],
    options: QUICK_FILTER_OPTIONS[id].map((value) => ({
      value,
      label: t(`contacts.${id}.${value}`, { defaultValue: value }),
      hint: t(`contacts.filters.hints.${id}.${value}`, { defaultValue: '' }) || undefined,
      icon: QUICK_FILTER_ICONS[id],
    })),
  }))
}
