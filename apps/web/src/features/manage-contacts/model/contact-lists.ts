import { TAXONOMY_KEY_PATTERN } from '@repo/shared-types'

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

export function contactsQueryString(state: {
  status: string | null
  search: string
  filters?: Readonly<Record<string, ReadonlyArray<string>>>
}): string {
  const params = new URLSearchParams()
  if (state.status) params.set('list', state.status)
  if (state.search.trim()) params.set('q', state.search.trim())
  for (const [key, values] of Object.entries(state.filters ?? {})) {
    if (values.length > 0) params.set(key, values.join(','))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function statusToListId(status: string | null): string {
  return status ?? LIST_ALL
}
