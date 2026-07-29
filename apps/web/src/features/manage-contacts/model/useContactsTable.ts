import { useCallback, useMemo, useState } from 'react'

import { useContactList } from '@/entities/contact'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'

import type { ContactStatus } from '@repo/shared-types'

const DEFAULT_LIMIT = 25

export function useContactsTable() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ContactStatus | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const debouncedSearch = useDebouncedValue(search)

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
    setPage(1)
  }, [])

  const handleStatus = useCallback((value: ContactStatus | null) => {
    setStatus(value)
    setPage(1)
  }, [])

  const handleLimit = useCallback((value: number) => {
    setLimit(value)
    setPage(1)
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
