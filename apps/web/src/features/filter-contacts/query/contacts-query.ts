import { parseSortParam, type ContactSort } from '@/entities/contact'
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'
import { isComplete, parseConditions } from '@/shared/ui/organisms/filter-bar'

import { EMPTY_QUICK_FILTERS, type QuickFilterState } from '../config/quick-filters.constants'
import {
  isArchivedList,
  ownerList,
  parseLimitParam,
  parseListParam,
  parsePageParam,
} from '../lib/contact-lists'
import { parseQuickFilters } from '../lib/quick-filters'

import type { ContactListQuery, FilterCondition } from '@repo/shared-types'

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

function quickFilterConditions(filters: QuickFilterState): FilterCondition[] {
  const conditions: FilterCondition[] = []
  if (filters.source.length > 0) {
    conditions.push({ field: 'source', operator: 'is_any_of', value: [...filters.source] })
  }
  if (filters.lifecycleStage.length > 0) {
    conditions.push({
      field: 'lifecycleStage',
      operator: 'is_any_of',
      value: [...filters.lifecycleStage],
    })
  }
  return conditions
}

export function contactListQuery(
  search: string,
  status: string | null,
  filters: QuickFilterState = EMPTY_QUICK_FILTERS,
  pagination: ContactListPagination = DEFAULT_PAGINATION,
  advanced: ReadonlyArray<FilterCondition> = [],
  viewerId?: string | null,
): ContactListQuery {
  const conditions = [...advanced, ...quickFilterConditions(filters)]
  const archived = isArchivedList(status)
  const owner = ownerList(status)
  return {
    q: search.trim() || undefined,
    advanced: conditions.length > 0 ? conditions : undefined,
    status: archived || owner ? undefined : (status ?? undefined),
    archived: archived || undefined,
    assignedToId: owner === 'mine' && viewerId ? viewerId : undefined,
    unassigned: owner === 'unassigned' || undefined,
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

  return contactListQuery(
    read('q') ?? '',
    parseListParam(read('list')),
    filters,
    {
      page: parsePageParam(read('page')),
      limit: parseLimitParam(read('limit')),
      sort: parseSortParam(read('sort')),
    },
    parseConditions(read('af')).filter((c) => isComplete(c)),
  )
}
