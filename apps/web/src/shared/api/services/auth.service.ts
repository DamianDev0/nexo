import apiUrl from '@/shared/api/http'
import { request } from '@/shared/api/request'

import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  OnboardingRequest,
  OnboardingResponse,
} from '@repo/shared-types'

const authService = {
  resolveTenant: (email: string) =>
    request<{ slug: string }>({ method: 'post', url: '/auth/resolve-tenant', data: { email } }),

  login: (data: LoginRequest) =>
    request<LoginResponse>({ method: 'post', url: '/auth/login', data }),

  onboard: (data: OnboardingRequest) =>
    request<OnboardingResponse>({ method: 'post', url: '/auth/onboard', data }),

  me: () => request<MeResponse>({ method: 'get', url: '/auth/me' }),

  logout: () => request<void>({ method: 'post', url: '/auth/logout' }),

  forgotPassword: (email: string) =>
    apiUrl.post('/auth/forgot-password', { email }).then(
      () => undefined,
      () => undefined,
    ),

  resetPassword: (token: string, newPassword: string) =>
    request<void>({ method: 'post', url: '/auth/reset-password', data: { token, newPassword } }),

  refreshToken: () => request<void>({ method: 'post', url: '/auth/refresh' }),

  getGoogleAuthUrl: () => `${apiUrl.defaults.baseURL}/auth/google`,
}

export default authService
