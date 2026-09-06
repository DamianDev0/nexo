import 'server-only'

import { contactListQueryFromParams } from '@/features/filter-contacts'
import { getContactCounts, getContactWorkspace, listContacts } from '@/shared/api/dal/contacts'
import { listTagCatalog } from '@/shared/api/dal/tags'
import { listTeamMembers } from '@/shared/api/dal/users'
import { QUERY_KEYS } from '@/shared/query/query-keys'
import { prefetch } from '@/shared/query/server-query'

import type { QueryClient } from '@tanstack/react-query'

const CONTACT_ENTITY_TYPE = 'contact'

export async function prefetchContacts(
  client: QueryClient,
  params: Record<string, string | string[] | undefined>,
): Promise<void> {
  const listQuery = contactListQueryFromParams(params)

  await Promise.all([
    prefetch(client, QUERY_KEYS.contacts.list(listQuery), () => listContacts(listQuery)),
    prefetch(client, QUERY_KEYS.contacts.counts, getContactCounts),
    prefetch(client, QUERY_KEYS.contacts.workspace, getContactWorkspace),
    prefetch(client, QUERY_KEYS.tags.catalog(CONTACT_ENTITY_TYPE), () =>
      listTagCatalog(CONTACT_ENTITY_TYPE),
    ),
    prefetch(client, QUERY_KEYS.team.members, listTeamMembers),
  ])
}
