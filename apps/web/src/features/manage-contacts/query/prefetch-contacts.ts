import 'server-only'

import { getContactCounts, listContacts } from '@/shared/api/dal/contacts'
import { QUERY_KEYS } from '@/shared/query/query-keys'
import { prefetch } from '@/shared/query/server-query'

import { contactListQueryFromParams } from './contacts-query'

import type { QueryClient } from '@tanstack/react-query'

export async function prefetchContacts(
  client: QueryClient,
  params: Record<string, string | string[] | undefined>,
): Promise<void> {
  const listQuery = contactListQueryFromParams(params)

  await Promise.all([
    prefetch(client, QUERY_KEYS.contacts.list(listQuery), () => listContacts(listQuery)),
    prefetch(client, QUERY_KEYS.contacts.counts, getContactCounts),
  ])
}
