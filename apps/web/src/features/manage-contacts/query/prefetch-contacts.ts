import 'server-only'

import { listContacts } from '@/shared/api/dal/contacts'
import { QUERY_KEYS } from '@/shared/query/query-keys'
import { prefetch } from '@/shared/query/server-query'

import { contactCountQuery, contactListQueryFromParams, COUNT_LISTS } from './contacts-query'

import type { QueryClient } from '@tanstack/react-query'

export async function prefetchContacts(
  client: QueryClient,
  params: Record<string, string | string[] | undefined>,
): Promise<void> {
  const listQuery = contactListQueryFromParams(params)

  await Promise.all([
    prefetch(client, QUERY_KEYS.contacts.list(listQuery), () => listContacts(listQuery)),
    ...COUNT_LISTS.map((status) => {
      const query = contactCountQuery(status)
      return prefetch(client, QUERY_KEYS.contacts.list(query), () => listContacts(query))
    }),
  ])
}
