import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useContactList } from '@/entities/contact'
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'

import { contactsQueryString, parseListParam } from './contact-lists'

import type { ContactStatus } from '@repo/shared-types'

export function useContactsTable() {
  const params = useSearchParams()
  const [search, setSearch] = useState(() => params?.get('q') ?? '')
  const [status, setStatus] = useState<ContactStatus | null>(() =>
    parseListParam(params?.get('list') ?? null),
  )
  const [page, setPage] = useState(FIRST_PAGE)
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE)
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    const query = contactsQueryString({ status, search: debouncedSearch })
    globalThis.history.replaceState(null, '', `${globalThis.location.pathname}${query}`)
  }, [status, debouncedSearch])

  const query = useMemo(
    () => ({
      q: debouncedSearch.trim() || undefined,
      status: status ?? undefined,
      page,
      limit,
    }),
    [debouncedSearch, status, page, limit],
  )

  const { data, isPending, isFetching } = useContactList(query)

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(FIRST_PAGE)
  }, [])

  const handleStatus = useCallback((value: ContactStatus | null) => {
    setStatus(value)
    setPage(FIRST_PAGE)
  }, [])

  const handleLimit = useCallback((value: number) => {
    setLimit(value)
    setPage(FIRST_PAGE)
  }, [])

  const total = data?.total ?? 0

  return {
    rows: data?.data ?? [],
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    page,
    limit,
    search,
    status,
    isPending,
    isFetching,
    isFiltered: Boolean(debouncedSearch.trim() || status),
    setPage,
    handleSearch,
    handleStatus,
    handleLimit,
  }
}
