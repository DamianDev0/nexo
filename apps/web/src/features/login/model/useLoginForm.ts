'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { sileo } from 'sileo'

import { useAuthStore } from '@/entities/session'
import { ROUTES } from '@/shared/config/routes'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { loginAction } from '../api/login.action'
import { loginSchema, type LoginFormValues } from '../lib/login.schema'

const ERROR_TOAST_KEYS = {
  workspace_not_found: {
    title: 'auth.toasts.workspaceNotFound',
    description: 'auth.toasts.workspaceNotFoundDesc',
  },
  invalid_credentials: { title: 'auth.toasts.loginFailed', description: null },
  unknown: { title: 'auth.toasts.loginFailed', description: null },
} as const

export function useLoginForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setTenantSlug } = useAuthStore()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  })

  const login = useMutation({
    mutationFn: loginAction,
    onSuccess: async (result) => {
      if (!result.ok) {
        const toast = ERROR_TOAST_KEYS[result.error]
        sileo.error({
          title: t(toast.title),
          description: toast.description ? t(toast.description) : undefined,
        })
        return
      }
      setTenantSlug(result.slug)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me })
      router.push(ROUTES.app.dashboard)
    },
    onError: () => {
      sileo.error({ title: t('auth.toasts.loginFailed') })
    },
  })

  return {
    control: form.control,
    handleSubmit: form.handleSubmit((values) => login.mutate(values)),
    isPending: login.isPending,
  }
}
