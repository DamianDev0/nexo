import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes.constants'
import authService from '@/core/services/auth.service'

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
