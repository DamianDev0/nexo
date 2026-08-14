import 'server-only'

import { apiFetch } from '../client'

import type { PaginatedNotifications } from '@repo/shared-types'

export const listUnreadNotifications = (limit: number) =>
  apiFetch<PaginatedNotifications>(`/notifications?unread=true&limit=${limit}`)
