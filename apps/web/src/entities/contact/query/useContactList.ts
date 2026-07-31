import { keepPreviousData, useQuery } from '@tanstack/react-query'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ContactListQuery } from '@repo/shared-types'

export function useContactList(query: ContactListQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.contacts.list(query),
    queryFn: () => contactsService.list(query),
    placeholderData: keepPreviousData,
  })
}
