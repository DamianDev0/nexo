import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useRouter } from 'next/navigation'
import { sileo } from 'sileo'

import { useAuthStore } from '@/entities/session'
import authService from '@/shared/api/services/auth.service'
import { QUERY_KEYS } from '@/shared/config/query-keys'

import type { OnboardingRequest } from '@repo/shared-types'

export function useOnboarding() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { setTenantSlug } = useAuthStore()

  return useMutation({
    mutationFn: (data: OnboardingRequest) => authService.onboard(data),
    onSuccess: (result) => {
      setTenantSlug(result.tenant.slug)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me })
      sileo.success({ title: t('auth.toasts.workspaceCreated', { name: result.tenant.name }) })
      router.push('/onboarding/setup')
    },
    onError: (error) => {
      sileo.error({ title: t('auth.toasts.onboardingFailed'), description: error.message })
    },
  })
}
