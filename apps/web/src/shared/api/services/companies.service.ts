import { request } from '@/shared/api/request'

import type { CompanySummary, PaginatedCompanies } from '@repo/shared-types'

export type CompanySearchQuery = {
  q?: string
  page?: number
  limit?: number
}

const companiesService = {
  list: (params: CompanySearchQuery) =>
    request<PaginatedCompanies>({ method: 'get', url: '/companies', params }),

  summary: (id: string) =>
    request<CompanySummary>({ method: 'get', url: `/companies/${id}/summary` }),

  assignContact: (id: string, contactId: string) =>
    request<void>({ method: 'post', url: `/companies/${id}/contacts`, data: { contactId } }),

  removeContact: (id: string, contactId: string) =>
    request<void>({ method: 'delete', url: `/companies/${id}/contacts/${contactId}` }),
}

export default companiesService
