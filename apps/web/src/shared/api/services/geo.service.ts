import { request } from '@/shared/api/request'

import type { Department, Municipality } from '@repo/shared-types'

const geoService = {
  listDepartments: () => request<Department[]>({ method: 'get', url: '/geo/departments' }),

  searchMunicipalities: (q: string, department?: string) =>
    request<Municipality[]>({
      method: 'get',
      url: '/geo/municipalities',
      params: { q, department },
    }),
}

export default geoService
