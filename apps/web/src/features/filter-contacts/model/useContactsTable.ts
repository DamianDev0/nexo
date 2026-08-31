'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useContactList, usePrefetchContactList } from '@/entities/contact'
import { parseSortParam, type ContactSort } from '@/entities/contact'
import { FIRST_PAGE } from '@/shared/config/pagination'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { pageCount } from '@/shared/lib/pagination'
import { isComplete, parseConditions, serializeConditions } from '@/shared/ui/organisms/filter-bar'

import {
  contactsQueryString,
  parseLimitParam,
  parseListParam,
  parsePageParam,
  type ContactsUrlState,
} from '../lib/contact-lists'
import {
  clearQuickFilters,
  hasQuickFilters,
  parseQuickFilters,
  toggleQuickFilter,
} from '../lib/quick-filters'
import { contactListQuery } from '../query/contacts-query'

import type { ContactListItem, FilterCondition } from '@repo/shared-types'

const NO_ROWS: readonly ContactListItem[] = []

export function useContactsTable() {
  const pathname = usePathname()
  const params = useSearchParams()

  const urlSearch = params.get('q') ?? ''
  const status = parseListParam(params.get('list'))
  const page = parsePageParam(params.get('page'))
  const limit = parseLimitParam(params.get('limit'))
  const sort = useMemo(() => parseSortParam(params.get('sort')), [params])
  const filters = useMemo(() => parseQuickFilters((key) => params.get(key)), [params])
  const advancedRaw = params.get('af')
  const urlAdvanced = useMemo(() => parseConditions(advancedRaw), [advancedRaw])

  const [search, setSearch] = useState(urlSearch)
  const [syncedSearch, setSyncedSearch] = useState(urlSearch)
  const [advanced, setAdvanced] = useState<ReadonlyArray<FilterCondition>>(urlAdvanced)
  const [syncedAdvanced, setSyncedAdvanced] = useState(advancedRaw)

  if (syncedSearch !== urlSearch) {
    setSyncedSearch(urlSearch)
    setSearch(urlSearch)
  }

  if (syncedAdvanced !== advancedRaw) {
    setSyncedAdvanced(advancedRaw)
    setAdvanced(urlAdvanced)
  }

  const debouncedSearch = useDebouncedValue(search)

  const commit = useCallback(
    (next: Partial<ContactsUrlState>) => {
      const state = {
        status,
        search: urlSearch,
        advanced: advancedRaw,
        filters,
        page,
        limit,
        sort,
        ...next,
      }
      window.history.replaceState(null, '', `${pathname}${contactsQueryString(state)}`)
    },
    [pathname, status, urlSearch, advancedRaw, filters, page, limit, sort],
  )

  const handleAdvanced = useCallback(
    (next: ReadonlyArray<FilterCondition>) => {
      setAdvanced(next)
      commit({ advanced: serializeConditions(next), page: FIRST_PAGE })
    },
    [commit],
  )

  useEffect(() => {
    if (debouncedSearch.trim() === urlSearch.trim()) return
    commit({ search: debouncedSearch, page: FIRST_PAGE })
  }, [debouncedSearch, urlSearch, commit])

  const query = useMemo(
    () =>
      contactListQuery(urlSearch, status, filters, { page, limit, sort }, advanced.filter((c) => isComplete(c))),
    [urlSearch, status, filters, page, limit, sort, advanced],
  )

  const { data, isPending, isFetching } = useContactList(query)

  const handleStatus = useCallback(
    (value: string | null) => commit({ status: value, page: FIRST_PAGE }),
    [commit],
  )

  const handleToggleFilter = useCallback(
    (filterId: string, value: string) =>
      commit({ filters: toggleQuickFilter(filters, filterId, value), page: FIRST_PAGE }),
    [commit, filters],
  )

  const handleClearFilters = useCallback(
    (filterId?: string) =>
      commit({ filters: clearQuickFilters(filters, filterId), page: FIRST_PAGE }),
    [commit, filters],
  )

  const handleLimit = useCallback(
    (value: number) => commit({ limit: value, page: FIRST_PAGE }),
    [commit],
  )

  const handlePage = useCallback((value: number) => commit({ page: value }), [commit])

  const handleSort = useCallback(
    (value: ContactSort | null) => commit({ sort: value, page: FIRST_PAGE }),
    [commit],
  )

  const total = data?.total ?? 0
  const totalPages = pageCount(total, limit)

  const prefetchList = usePrefetchContactList()

  const prefetchPage = useCallback(
    (value: number) => {
      if (value < FIRST_PAGE || value > totalPages || value === page) return
      prefetchList(contactListQuery(urlSearch, status, filters, { page: value, limit, sort }))
    },
    [prefetchList, urlSearch, status, filters, page, limit, sort, totalPages],
  )

  return {
    rows: data?.data ?? NO_ROWS,
    total,
    totalPages,
    page,
    limit,
    search,
    status,
    filters,
    sort,
    isPending,
    isFetching,
    isFiltered:
      Boolean(urlSearch.trim() || status) || hasQuickFilters(filters) || advanced.length > 0,
    advanced,
    handleAdvanced,
    handleSearch: setSearch,
    handleSort,
    handlePage,
    prefetchPage,
    handleStatus,
    handleToggleFilter,
    handleClearFilters,
    handleLimit,
  }
}
