import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import settingsService from '@/core/services/settings.service'
import { ROUTES } from '@/constants/routes.constants'
import { QUERY_KEYS } from '@/constants/query-keys.constants'

const TOTAL_STEPS = 6
const ONBOARDING_KEY = ['settings', 'onboarding'] as const

export function useOnboardingWizard() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ONBOARDING_KEY,
    queryFn: () => settingsService.getOnboarding(),
  })

  // Derive current step from server state (TanStack Query IS the cache)
  const currentStep = data?.step ?? 1

  const { mutate: persistStep } = useMutation({
    mutationFn: (step: number) => settingsService.updateOnboarding({ step }),
    onSuccess: (result) => {
      queryClient.setQueryData(ONBOARDING_KEY, result)
    },
  })

  const goToStep = useCallback(
    (step: number) => {
      persistStep(step)
    },
    [persistStep],
  )

  const nextStep = useCallback(() => {
    goToStep(Math.min(currentStep + 1, TOTAL_STEPS))
  }, [currentStep, goToStep])

  const prevStep = useCallback(() => {
    goToStep(Math.max(currentStep - 1, 1))
  }, [currentStep, goToStep])

  const skipSetup = useCallback(() => {
    goToStep(TOTAL_STEPS)
  }, [goToStep])

  const completeOnboarding = useCallback(async () => {
    await settingsService.updateOnboarding({ step: TOTAL_STEPS, completed: true })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me })
    sileo.success({ title: 'Setup complete!', description: 'Welcome to Nexo CRM' })
    router.push(ROUTES.app.dashboard)
  }, [queryClient, router])

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    progressPercent: Math.round((currentStep / TOTAL_STEPS) * 100),
    goToStep,
    nextStep,
    prevStep,
    skipSetup,
    completeOnboarding,
  }
}
