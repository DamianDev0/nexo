import apiUrl from '@/shared/api/http'
import { request } from '@/shared/api/request'

import type { MeResponse } from '@repo/shared-types'

const authService = {
  me: () => request<MeResponse>({ method: 'get', url: '/auth/me' }),

  logout: () => request<void>({ method: 'post', url: '/auth/logout' }),

  refreshToken: () => request<void>({ method: 'post', url: '/auth/refresh' }),

  getGoogleAuthUrl: () => `${apiUrl.defaults.baseURL}/auth/google`,
}

export default authService
