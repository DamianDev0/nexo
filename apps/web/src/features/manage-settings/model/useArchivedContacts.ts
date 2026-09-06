'use client'

import { useState } from 'react'

import { useCreateBulkAction } from '@/entities/bulk-action'
import { useContactList, useRestoreContact } from '@/entities/contact'
import { COMPACT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'
import { pageCount } from '@/shared/lib/pagination'

export function useArchivedContacts() {
  const [page, setPage] = useState(FIRST_PAGE)
  const { data, isPending } = useContactList({ archived: true, page, limit: COMPACT_PAGE_SIZE })
  const restoreOne = useRestoreContact()
  const restoreAll = useCreateBulkAction()

  const total = data?.total ?? 0
  const totalPages = pageCount(total, COMPACT_PAGE_SIZE)
  if (page > totalPages && totalPages >= FIRST_PAGE) setPage(totalPages)

  return {
    contacts: data?.data ?? [],
    total,
    isPending,
    pagination: { page, totalPages, onPageChange: setPage },
    restoreOne,
    restoreAll: () =>
      restoreAll.mutate({
        entity: 'contacts',
        action: 'restore',
        params: {},
        selection: { mode: 'filter', query: { archived: true } },
      }),
    isRestoringAll: restoreAll.isPending,
  }
}
