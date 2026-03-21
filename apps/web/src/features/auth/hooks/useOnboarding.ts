import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/constants/query-keys.constants'
import { ROUTES } from '@/constants/routes.constants'
import authService from '@/core/services/auth.service'
import type { OnboardingRequest } from '@repo/shared-types'

export function useOnboarding() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: OnboardingRequest) => authService.onboard(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me })
      toast.success(`${result.tenant.name} created successfully`)
      router.push(ROUTES.app.dashboard)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
