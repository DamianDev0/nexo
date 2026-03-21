import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/constants/query-keys.constants'
import { ROUTES } from '@/constants/routes.constants'
import authService from '@/core/services/auth.service'
import type { LoginRequest } from '@repo/shared-types'

export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me })
      router.push(ROUTES.app.dashboard)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
