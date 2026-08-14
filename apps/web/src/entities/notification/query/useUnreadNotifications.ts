import { useQuery } from '@tanstack/react-query'

import notificationsService from '@/shared/api/services/notifications.service'
import { NOTIFICATION_PAGE_SIZE } from '@/shared/config/pagination'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { NOTIFICATION_FEED_REFETCH_MS } from '../config/notification.constants'

export function useUnreadNotifications(limit: number = NOTIFICATION_PAGE_SIZE) {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.unread(limit),
    queryFn: () => notificationsService.list({ unread: 'true', limit }),
    refetchInterval: NOTIFICATION_FEED_REFETCH_MS,
  })
}
