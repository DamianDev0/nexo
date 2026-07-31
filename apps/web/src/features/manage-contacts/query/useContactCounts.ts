import { ContactStatus } from '@repo/shared-types'
import { useQueries } from '@tanstack/react-query'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/config/query-keys'

import type { ContactListQuery } from '@repo/shared-types'

const COUNT_LISTS: ReadonlyArray<ContactStatus | null> = [
  null,
  ContactStatus.NEW,
  ContactStatus.IN_CONTACT,
  ContactStatus.QUALIFIED,
  ContactStatus.CLIENT,
  ContactStatus.LOST,
]

const COUNT_STALE_MS = 30 * 1000

function countQuery(status: ContactStatus | null): ContactListQuery {
  return { status: status ?? undefined, page: 1, limit: 1 }
}

export function useContactCounts(): Record<string, number | undefined> {
  const results = useQueries({
    queries: COUNT_LISTS.map((status) => ({
      queryKey: QUERY_KEYS.contacts.list(countQuery(status)),
      queryFn: () => contactsService.list(countQuery(status)),
      staleTime: COUNT_STALE_MS,
    })),
  })

  return Object.fromEntries(
    COUNT_LISTS.map((status, index) => [status ?? 'all', results[index]?.data?.total]),
  )
}
