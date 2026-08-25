import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactListQuery } from '@repo/shared-types'

const LIST_STALE_MS = 30 * 1000

function listOptions(query: ContactListQuery) {
  return {
    queryKey: QUERY_KEYS.contacts.list(query),
    queryFn: () => contactsService.list(query),
    staleTime: LIST_STALE_MS,
  }
}

export function useContactList(query: ContactListQuery) {
  return useQuery({ ...listOptions(query), placeholderData: keepPreviousData })
}

export function usePrefetchContactList() {
  const client = useQueryClient()

  return useCallback(
    (query: ContactListQuery) => void client.prefetchQuery(listOptions(query)),
    [client],
  )
}
