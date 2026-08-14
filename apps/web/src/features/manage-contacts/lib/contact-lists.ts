import { TAXONOMY_KEY_PATTERN } from '@repo/shared-types'

import { DEFAULT_PAGE_SIZE, FIRST_PAGE, PAGE_SIZE_OPTIONS } from '@/shared/config/pagination'

import type { QuickFilterState } from '../config/quick-filters.constants'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { SmartListItem } from '@/shared/ui/organisms/data-table'
import type { TFunction } from 'i18next'

const LIST_ALL = 'all'

export function buildSmartLists(
  t: TFunction,
  counts: Record<string, number | undefined>,
  statuses: ReadonlyArray<TaxonomyChoice>,
): ReadonlyArray<SmartListItem> {
  return [
    {
      id: LIST_ALL,
      label: t('contacts.lists.all'),
      count: counts[LIST_ALL],
      description: t('contacts.lists.descriptions.all'),
      pinned: true,
    },
    ...statuses.map((status) => ({
      id: status.key,
      label: status.label,
      count: counts[status.key] ?? 0,
      description:
        t(`contacts.lists.descriptions.${status.key}`, { defaultValue: '' }) || undefined,
    })),
  ]
}

export function listIdToStatus(id: string): string | null {
  return id === LIST_ALL ? null : id
}

export function parseListParam(value: string | null): string | null {
  if (!value || value === LIST_ALL) return null
  return TAXONOMY_KEY_PATTERN.test(value) ? value : null
}

export interface ContactsUrlState {
  readonly status: string | null
  readonly search: string
  readonly filters: QuickFilterState
  readonly page: number
  readonly limit: number
}

export function parsePageParam(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE
}

export function parseLimitParam(value: string | null): number {
  const limit = Number(value)
  return PAGE_SIZE_OPTIONS.includes(limit) ? limit : DEFAULT_PAGE_SIZE
}

export function contactsQueryString(state: {
  status: string | null
  search: string
  filters?: Readonly<Record<string, ReadonlyArray<string>>>
  page?: number
  limit?: number
}): string {
  const params = new URLSearchParams()
  if (state.status) params.set('list', state.status)
  if (state.search.trim()) params.set('q', state.search.trim())
  for (const [key, values] of Object.entries(state.filters ?? {})) {
    if (values.length > 0) params.set(key, values.join(','))
  }
  if (state.page && state.page > FIRST_PAGE) params.set('page', String(state.page))
  if (state.limit && state.limit !== DEFAULT_PAGE_SIZE) params.set('limit', String(state.limit))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function statusToListId(status: string | null): string {
  return status ?? LIST_ALL
}
