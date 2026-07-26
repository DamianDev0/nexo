import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useRouter } from 'next/navigation'
import { sileo } from 'sileo'

import authService from '@/shared/api/services/auth.service'
import { QUERY_KEYS } from '@/shared/config/query-keys'
import { ROUTES } from '@/shared/config/routes'

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
      sileo.error({ title: t('auth.toasts.loginFailed'), description: error.message })
    },
  })
}
