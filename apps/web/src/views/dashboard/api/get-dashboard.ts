import 'server-only'

import { redirect } from 'next/navigation'

import { ApiError } from '@/shared/api/api-error'
import { CACHE_TAGS } from '@/shared/api/cache-tags'
import { apiFetch } from '@/shared/api/client'
import { ROUTES } from '@/shared/config/routes'

import type { GeneralSettings, MeResponse } from '@repo/shared-types'

export interface DashboardData {
  readonly user: MeResponse
  readonly settings: GeneralSettings | null
}

export async function getDashboard(): Promise<DashboardData> {
  try {
    const [user, settings] = await Promise.all([
      apiFetch<MeResponse>('/auth/me', { tags: [CACHE_TAGS.me], revalidate: 2 }),
      apiFetch<GeneralSettings | null>('/settings/general', {
        tags: [CACHE_TAGS.settingsGeneral],
      }),
    ])
    return { user, settings }
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) redirect(ROUTES.auth.login)
    throw error
  }
}
