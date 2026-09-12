import { request } from '@/shared/api/request'

import type { DealStatus, PaginatedDeals } from '@repo/shared-types'

export type DealListQuery = {
  contactId?: string
  companyId?: string
  status?: DealStatus
  page?: number
  limit?: number
}

const dealsService = {
  list: (params: DealListQuery) =>
    request<PaginatedDeals>({ method: 'get', url: '/deals', params }),
}

export default dealsService
