import { useQuery } from '@tanstack/react-query'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

const COUNT_STALE_MS = 30 * 1000

export function useContactCounts(): Record<string, number | undefined> {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.contacts.counts,
    queryFn: contactsService.counts,
    staleTime: COUNT_STALE_MS,
  })

  return {
    all: data?.total,
    mine: data?.mine,
    unassigned: data?.unassigned,
    unassignedRecent: data?.unassignedRecent,
    archived: data?.archived,
    ...data?.byStatus,
  }
}
