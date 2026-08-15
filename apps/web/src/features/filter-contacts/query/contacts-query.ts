import { parseSortParam, type ContactSort } from '@/entities/contact'
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'

import { EMPTY_QUICK_FILTERS, type QuickFilterState } from '../config/quick-filters.constants'
import { parseLimitParam, parseListParam, parsePageParam } from '../lib/contact-lists'
import { parseQuickFilters } from '../lib/quick-filters'

import type { ContactListQuery } from '@repo/shared-types'

type ContactListPagination = {
  readonly page: number
  readonly limit: number
  readonly sort?: ContactSort | null
}

const DEFAULT_PAGINATION: ContactListPagination = {
  page: FIRST_PAGE,
  limit: DEFAULT_PAGE_SIZE,
  sort: null,
}

export function contactListQuery(
  search: string,
  status: string | null,
  filters: QuickFilterState = EMPTY_QUICK_FILTERS,
  pagination: ContactListPagination = DEFAULT_PAGINATION,
): ContactListQuery {
  return {
    q: search.trim() || undefined,
    status: status ?? undefined,
    lifecycleStage: (filters.lifecycleStage[0] as ContactListQuery['lifecycleStage']) ?? undefined,
    source: filters.source[0] ?? undefined,
    page: pagination.page,
    limit: pagination.limit,
    sortBy: pagination.sort?.field,
    sortDir: pagination.sort?.direction,
  }
}

export function contactListQueryFromParams(
  params: Record<string, string | string[] | undefined>,
): ContactListQuery {
  const read = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : null)
  const filters = parseQuickFilters(read)

  return contactListQuery(read('q') ?? '', parseListParam(read('list')), filters, {
    page: parsePageParam(read('page')),
    limit: parseLimitParam(read('limit')),
    sort: parseSortParam(read('sort')),
  })
}
