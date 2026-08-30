import axios from 'axios'

import { isGuestOnlyPath } from '@/shared/lib/route-access'

import { tenantRef } from './tenant-ref'

import type { AxiosRequestConfig } from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'

const isBrowser = typeof globalThis !== 'undefined' && 'location' in globalThis

const PUBLIC_AUTH_URLS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/resolve-tenant',
]

const apiUrl = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

apiUrl.interceptors.request.use((config) => {
  const slug = tenantRef.get()
  if (slug) {
    config.headers['x-tenant-slug'] = slug
  }
  return config
})

let refreshPromise: Promise<void> | null = null

function refreshSession(): Promise<void> {
  refreshPromise ??= apiUrl
    .post('/auth/refresh')
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

function redirectToLogin(): void {
  if (!isGuestOnlyPath(globalThis.location.pathname)) {
    globalThis.location.href = '/login'
  }
}

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean }

function canAttemptRefresh(config: RetriableConfig | undefined): config is RetriableConfig {
  if (!config?.url || config._retry) return false
  return !PUBLIC_AUTH_URLS.some((url) => config.url?.includes(url))
}

apiUrl.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error
    if (error.response?.status !== 401 || !isBrowser) throw error

    const config = error.config as RetriableConfig | undefined
    if (canAttemptRefresh(config)) {
      try {
        await refreshSession()
        config._retry = true
        return await apiUrl.request(config)
      } catch {
        redirectToLogin()
        throw error
      }
    }

    redirectToLogin()
    throw error
  },
)

export default apiUrl
