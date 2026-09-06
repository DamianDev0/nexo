'use client'

import { useQuery } from '@tanstack/react-query'

import bulkActionsService from '@/shared/api/services/bulk-actions.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { BULK_POLL_INTERVAL_MS } from '../config/bulk-status.constants'
import { isBulkActionActive } from '../lib/bulk-action-labels'

export function useBulkActionStatus(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.bulkActions.detail(id ?? ''),
    queryFn: () => bulkActionsService.get(id ?? ''),
    enabled: id !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status && isBulkActionActive(status) ? BULK_POLL_INTERVAL_MS : false
    },
  })
}
