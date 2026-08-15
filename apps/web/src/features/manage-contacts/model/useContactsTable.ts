'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useContactList, usePrefetchContactList } from '@/entities/contact'
import { FIRST_PAGE } from '@/shared/config/pagination'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'

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

import type { ContactListItem } from '@repo/shared-types'

const NO_ROWS: readonly ContactListItem[] = []

export function useContactsTable() {
  const pathname = usePathname()
  const params = useSearchParams()

  const urlSearch = params.get('q') ?? ''
  const status = parseListParam(params.get('list'))
  const page = parsePageParam(params.get('page'))
  const limit = parseLimitParam(params.get('limit'))
  const filters = useMemo(() => parseQuickFilters((key) => params.get(key)), [params])

  const [search, setSearch] = useState(urlSearch)
  const [syncedSearch, setSyncedSearch] = useState(urlSearch)

  if (syncedSearch !== urlSearch) {
    setSyncedSearch(urlSearch)
    setSearch(urlSearch)
  }

  const debouncedSearch = useDebouncedValue(search)

  const commit = useCallback(
    (next: Partial<ContactsUrlState>) => {
      const state = { status, search: urlSearch, filters, page, limit, ...next }
      window.history.replaceState(null, '', `${pathname}${contactsQueryString(state)}`)
    },
    [pathname, status, urlSearch, filters, page, limit],
  )

  useEffect(() => {
    if (debouncedSearch.trim() === urlSearch.trim()) return
    commit({ search: debouncedSearch, page: FIRST_PAGE })
  }, [debouncedSearch, urlSearch, commit])

  const query = useMemo(
    () => contactListQuery(urlSearch, status, filters, { page, limit }),
    [urlSearch, status, filters, page, limit],
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

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const prefetchList = usePrefetchContactList()

  const prefetchPage = useCallback(
    (value: number) => {
      if (value < FIRST_PAGE || value > totalPages || value === page) return
      prefetchList(contactListQuery(urlSearch, status, filters, { page: value, limit }))
    },
    [prefetchList, urlSearch, status, filters, page, limit, totalPages],
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
    isPending,
    isFetching,
    isFiltered: Boolean(urlSearch.trim() || status) || hasQuickFilters(filters),
    handleSearch: setSearch,
    handlePage,
    prefetchPage,
    handleStatus,
    handleToggleFilter,
    handleClearFilters,
    handleLimit,
  }
}
