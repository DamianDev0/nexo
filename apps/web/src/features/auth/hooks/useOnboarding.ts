import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { sileo } from 'sileo'
import { QUERY_KEYS } from '@/constants/query-keys.constants'
import { ROUTES } from '@/constants/routes.constants'
import { useAuthStore } from '@/store/auth.store'
import authService from '@/core/services/auth.service'
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
      sileo.success({ title: `${result.tenant.name} created successfully` })
      router.push(ROUTES.app.dashboard)
    },
    onError: (error) => {
      sileo.error({ title: 'Onboarding failed', description: error.message })
    },
  })
}
