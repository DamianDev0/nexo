'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlanName } from '@repo/shared-types'
import { slugify } from '@repo/shared-utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { sileo } from 'sileo'

import { useAuthStore } from '@/entities/session'
import { QUERY_KEYS } from '@/shared/config/query-keys'
import { ROUTES } from '@/shared/config/routes'

import { registerWorkspaceAction } from '../api/register-workspace.action'

import { onboardingSchema, type OnboardingFormValues } from './onboarding.schema'

export function useOnboardingForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setTenantSlug } = useAuthStore()

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: '',
      slug: '',
      planName: PlanName.FREE,
      ownerFullName: '',
      ownerEmail: '',
      ownerPassword: '',
    },
    mode: 'onBlur',
  })

  const register = useMutation({
    mutationFn: registerWorkspaceAction,
    onSuccess: async (result) => {
      if (!result.ok) {
        sileo.error({ title: t('auth.toasts.onboardingFailed'), description: result.error })
        return
      }
      setTenantSlug(result.tenant.slug)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me })
      sileo.success({ title: t('auth.toasts.workspaceCreated', { name: result.tenant.name }) })
      router.push(ROUTES.setup.onboarding)
    },
    onError: () => {
      sileo.error({ title: t('auth.toasts.onboardingFailed') })
    },
  })

  const handleBusinessNameChange = useCallback(
    (value: string, onChange: (value: string) => void) => {
      onChange(value)
      form.setValue('slug', slugify(value))
    },
    [form],
  )

  return {
    control: form.control,
    handleSubmit: form.handleSubmit((values) => register.mutate(values)),
    handleBusinessNameChange,
    isPending: register.isPending,
  }
}
