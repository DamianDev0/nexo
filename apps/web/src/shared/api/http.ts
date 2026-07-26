import axios from 'axios'

import { tenantRef } from './tenant-ref'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'

const isBrowser = typeof globalThis !== 'undefined' && 'location' in globalThis

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

apiUrl.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    if (error.response?.status === 401 && isBrowser) {
      const path = globalThis.location.pathname
      const isAuthRoute = path.includes('/login') || path.includes('/onboarding')

      if (!isAuthRoute) {
        globalThis.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default apiUrl
