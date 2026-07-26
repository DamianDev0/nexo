import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/entities/session'
import authService from '@/shared/api/services/auth.service'
import { ROUTES } from '@/shared/config/routes'

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { clearUser } = useAuthStore()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearUser()
      queryClient.clear()
      router.push(ROUTES.auth.login)
    },
  })
}
