import { ContactStatus } from '@repo/shared-types'

import { COUNT_ONLY_PAGE_SIZE, DEFAULT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'

import { parseListParam } from '../model/contact-lists'

import type { ContactListQuery } from '@repo/shared-types'

export const COUNT_LISTS: ReadonlyArray<ContactStatus | null> = [
  null,
  ContactStatus.NEW,
  ContactStatus.IN_CONTACT,
  ContactStatus.QUALIFIED,
  ContactStatus.CLIENT,
  ContactStatus.LOST,
]

export function contactCountQuery(status: ContactStatus | null): ContactListQuery {
  return { status: status ?? undefined, page: FIRST_PAGE, limit: COUNT_ONLY_PAGE_SIZE }
}

export function contactListQuery(search: string, status: ContactStatus | null): ContactListQuery {
  return {
    q: search.trim() || undefined,
    status: status ?? undefined,
    page: FIRST_PAGE,
    limit: DEFAULT_PAGE_SIZE,
  }
}

export function contactListQueryFromParams(
  params: Record<string, string | string[] | undefined>,
): ContactListQuery {
  const search = typeof params.q === 'string' ? params.q : ''
  const list = typeof params.list === 'string' ? params.list : null
  return contactListQuery(search, parseListParam(list))
}
