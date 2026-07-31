import { ContactStatus } from '@repo/shared-types'

import type { SmartListItem } from '@/shared/ui/organisms/data-table'
import type { TFunction } from 'i18next'

const LIST_ALL = 'all'

const LIST_STATUSES: readonly ContactStatus[] = [
  ContactStatus.NEW,
  ContactStatus.IN_CONTACT,
  ContactStatus.QUALIFIED,
  ContactStatus.CLIENT,
  ContactStatus.LOST,
]

export function buildSmartLists(
  t: TFunction,
  counts: Record<string, number | undefined>,
): ReadonlyArray<SmartListItem> {
  return [
    {
      id: LIST_ALL,
      label: t('contacts.lists.all'),
      count: counts[LIST_ALL],
      description: t('contacts.lists.descriptions.all'),
    },
    ...LIST_STATUSES.map((status) => ({
      id: status,
      label: t(`contacts.status.${status}`),
      count: counts[status],
      description: t(`contacts.lists.descriptions.${status}`),
    })),
  ]
}

export function listIdToStatus(id: string): ContactStatus | null {
  return id === LIST_ALL ? null : (id as ContactStatus)
}

export function parseListParam(value: string | null): ContactStatus | null {
  if (!value || value === LIST_ALL) return null
  return (LIST_STATUSES as readonly string[]).includes(value) ? (value as ContactStatus) : null
}

export function contactsQueryString(state: {
  status: ContactStatus | null
  search: string
}): string {
  const params = new URLSearchParams()
  if (state.status) params.set('list', state.status)
  if (state.search.trim()) params.set('q', state.search.trim())
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function statusToListId(status: ContactStatus | null): string {
  return status ?? LIST_ALL
}
