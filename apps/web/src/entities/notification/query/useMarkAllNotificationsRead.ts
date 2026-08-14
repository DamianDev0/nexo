import { useMutation, useQueryClient } from '@tanstack/react-query'

import notificationsService from '@/shared/api/services/notifications.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all }),
  })
}
