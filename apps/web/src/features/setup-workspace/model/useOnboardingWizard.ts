import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { sileo } from 'sileo'

import settingsService from '@/shared/api/services/settings.service'
import { ROUTES } from '@/shared/config/routes'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { STEP_KEYS } from '../config/wizard.constants'

const TOTAL_STEPS = STEP_KEYS.length

export function useOnboardingWizard() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: QUERY_KEYS.settings.onboarding,
    queryFn: () => settingsService.getOnboarding(),
  })

  const currentStep = data?.step ?? 1

  const { mutate: persistStep } = useMutation({
    mutationFn: (step: number) => settingsService.updateOnboarding({ step }),
    onSuccess: (result) => {
      queryClient.setQueryData(QUERY_KEYS.settings.onboarding, result)
    },
    onError: (err) => sileo.error({ title: t('common.saveFailed'), description: err.message }),
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
    sileo.success({
      title: t('auth.toasts.setupComplete'),
      description: t('auth.toasts.welcomeToNexo'),
    })
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
