import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { sileo } from 'sileo'
import { QUERY_KEYS } from '@/constants/query-keys.constants'
import { ROUTES } from '@/constants/routes.constants'
import authService from '@/core/services/auth.service'
import type { LoginRequest } from '@repo/shared-types'

export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me })
      const me = queryClient.getQueryData<{ onboardingCompleted?: boolean }>(QUERY_KEYS.auth.me)
      router.push(me?.onboardingCompleted === false ? '/onboarding/setup' : ROUTES.app.dashboard)
    },
    onError: (error) => {
      sileo.error({ title: 'Login failed', description: error.message })
    },
  })
}
