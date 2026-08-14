import { request } from '@/shared/api/request'

import type { AddressSuggestion, Department, Municipality } from '@repo/shared-types'

const geoService = {
  listDepartments: () => request<Department[]>({ method: 'get', url: '/geo/departments' }),

  searchMunicipalities: (q: string, department?: string) =>
    request<Municipality[]>({
      method: 'get',
      url: '/geo/municipalities',
      params: { q, department },
    }),

  suggestAddresses: (q: string, sessionToken?: string) =>
    request<AddressSuggestion[]>({
      method: 'get',
      url: '/geo/address-suggestions',
      params: { q, sessionToken },
    }),
}

export default geoService
