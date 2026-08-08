import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useContactList } from '@/entities/contact'
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'

import { EMPTY_QUICK_FILTERS, type QuickFilterState } from '../config/quick-filters.constants'
import { contactsQueryString, parseListParam } from '../lib/contact-lists'
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
  const params = useSearchParams()
  const [search, setSearch] = useState(() => params?.get('q') ?? '')
  const [status, setStatus] = useState<string | null>(() =>
    parseListParam(params?.get('list') ?? null),
  )
  const [filters, setFilters] = useState<QuickFilterState>(() =>
    params ? parseQuickFilters((key) => params.get(key)) : EMPTY_QUICK_FILTERS,
  )
  const [page, setPage] = useState(FIRST_PAGE)
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE)
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    const query = contactsQueryString({ status, search: debouncedSearch, filters })
    globalThis.history.replaceState(null, '', `${globalThis.location.pathname}${query}`)
  }, [status, debouncedSearch, filters])

  const query = useMemo(
    () => contactListQuery(debouncedSearch, status, filters, { page, limit }),
    [debouncedSearch, status, filters, page, limit],
  )

  const { data, isPending, isFetching } = useContactList(query)

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(FIRST_PAGE)
  }, [])

  const handleStatus = useCallback((value: string | null) => {
    setStatus(value)
    setPage(FIRST_PAGE)
  }, [])

  const handleToggleFilter = useCallback((filterId: string, value: string) => {
    setFilters((current) => toggleQuickFilter(current, filterId, value))
    setPage(FIRST_PAGE)
  }, [])

  const handleClearFilters = useCallback((filterId?: string) => {
    setFilters((current) => clearQuickFilters(current, filterId))
    setPage(FIRST_PAGE)
  }, [])

  const handleLimit = useCallback((value: number) => {
    setLimit(value)
    setPage(FIRST_PAGE)
  }, [])

  const total = data?.total ?? 0

  return {
    rows: data?.data ?? NO_ROWS,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    page,
    limit,
    search,
    status,
    filters,
    isPending,
    isFetching,
    isFiltered: Boolean(debouncedSearch.trim() || status) || hasQuickFilters(filters),
    setPage,
    handleSearch,
    handleStatus,
    handleToggleFilter,
    handleClearFilters,
    handleLimit,
  }
}
