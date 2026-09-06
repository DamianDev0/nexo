import { request } from '@/shared/api/request'

import type {
  BulkAction,
  BulkActionError,
  BulkActionListQuery,
  CreateBulkActionInput,
  PaginatedBulkActions,
} from '@repo/shared-types'

const bulkActionsService = {
  create: (data: CreateBulkActionInput) =>
    request<BulkAction>({ method: 'post', url: '/bulk-actions', data }),

  list: (params: BulkActionListQuery) =>
    request<PaginatedBulkActions>({ method: 'get', url: '/bulk-actions', params }),

  get: (id: string) => request<BulkAction>({ method: 'get', url: `/bulk-actions/${id}` }),

  errors: (id: string) =>
    request<BulkActionError[]>({ method: 'get', url: `/bulk-actions/${id}/errors` }),

  cancel: (id: string) =>
    request<BulkAction>({ method: 'post', url: `/bulk-actions/${id}/cancel` }),

  revert: (id: string) =>
    request<BulkAction>({ method: 'post', url: `/bulk-actions/${id}/revert` }),
}

export default bulkActionsService
