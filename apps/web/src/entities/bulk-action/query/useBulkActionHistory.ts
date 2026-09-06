'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import bulkActionsService from '@/shared/api/services/bulk-actions.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { BULK_POLL_INTERVAL_MS } from '../config/bulk-status.constants'
import { isBulkActionActive } from '../lib/bulk-action-labels'

import type { BulkActionListQuery } from '@repo/shared-types'

export function useBulkActionHistory(query: BulkActionListQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.bulkActions.list(query),
    queryFn: () => bulkActionsService.list(query),
    placeholderData: keepPreviousData,
    refetchInterval: (state) =>
      state.state.data?.data.some((action) => isBulkActionActive(action.status))
        ? BULK_POLL_INTERVAL_MS
        : false,
  })
}

export function useRevertBulkAction() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bulkActionsService.revert(id),
    onSettled: () => void client.invalidateQueries({ queryKey: QUERY_KEYS.bulkActions.all }),
  })
}

export function useCancelBulkAction() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bulkActionsService.cancel(id),
    onSettled: () => void client.invalidateQueries({ queryKey: QUERY_KEYS.bulkActions.all }),
  })
}
