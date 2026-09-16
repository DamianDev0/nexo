import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { QueryClient } from '@tanstack/react-query'

const RECORD_KEYS = [
  QUERY_KEYS.contacts.lists,
  QUERY_KEYS.contacts.counts,
  QUERY_KEYS.contacts.taxonomyUsage,
] as const

export async function invalidateContactRecords(
  client: QueryClient,
  contactId?: string,
): Promise<void> {
  const keys = contactId
    ? [
        ...RECORD_KEYS,
        QUERY_KEYS.contacts.detail(contactId),
        QUERY_KEYS.contacts.timeline(contactId),
      ]
    : RECORD_KEYS
  await Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })))
}
