import { useQueries } from '@tanstack/react-query'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { contactCountQuery, COUNT_LISTS } from './contacts-query'

const COUNT_STALE_MS = 30 * 1000

export function useContactCounts(): Record<string, number | undefined> {
  const results = useQueries({
    queries: COUNT_LISTS.map((status) => ({
      queryKey: QUERY_KEYS.contacts.list(contactCountQuery(status)),
      queryFn: () => contactsService.list(contactCountQuery(status)),
      staleTime: COUNT_STALE_MS,
    })),
  })

  return Object.fromEntries(
    COUNT_LISTS.map((status, index) => [status ?? 'all', results[index]?.data?.total]),
  )
}
