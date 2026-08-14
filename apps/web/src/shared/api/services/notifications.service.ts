import { request } from '@/shared/api/request'

import type { PaginatedNotifications } from '@repo/shared-types'

const notificationsService = {
  list: (params: { unread?: 'true' | 'false'; page?: number; limit?: number } = {}) =>
    request<PaginatedNotifications>({ method: 'get', url: '/notifications', params }),

  markAsRead: (id: string) => request<void>({ method: 'patch', url: `/notifications/${id}/read` }),

  markAllAsRead: () =>
    request<{ updated: number }>({ method: 'patch', url: '/notifications/mark-all-read' }),
}

export default notificationsService
