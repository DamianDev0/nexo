'use client'

import { useMemo, useState } from 'react'

import {
  useBulkActionHistory,
  useCancelBulkAction,
  useRevertBulkAction,
} from '@/entities/bulk-action'
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'
import { pageCount } from '@/shared/lib/pagination'

import type { BulkAction } from '@repo/shared-types'

export function useBulkHistory() {
  const [page, setPage] = useState(FIRST_PAGE)
  const [pendingRevert, setPendingRevert] = useState<BulkAction | null>(null)
  const query = useMemo(() => ({ page, limit: DEFAULT_PAGE_SIZE }), [page])
  const { data, isPending } = useBulkActionHistory(query)
  const cancel = useCancelBulkAction()
  const revert = useRevertBulkAction()

  const total = data?.total ?? 0
  const totalPages = pageCount(total, DEFAULT_PAGE_SIZE)
  if (page > totalPages && totalPages >= FIRST_PAGE) setPage(totalPages)

  return {
    rows: data?.data ?? [],
    total,
    isPending,
    pagination: { page, totalPages, onPageChange: setPage },
    rowActions: {
      onCancel: (id: string) => cancel.mutate(id),
      onRevert: (action: BulkAction) => setPendingRevert(action),
      isBusy: cancel.isPending || revert.isPending,
    },
    revertDialog: {
      action: pendingRevert,
      close: () => setPendingRevert(null),
      confirm: () => {
        if (pendingRevert) revert.mutate(pendingRevert.id)
        setPendingRevert(null)
      },
    },
  }
}

export type BulkHistoryRowActions = ReturnType<typeof useBulkHistory>['rowActions']
