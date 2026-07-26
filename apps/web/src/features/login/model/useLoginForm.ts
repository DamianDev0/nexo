import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { t } from 'i18next'
import { useForm } from 'react-hook-form'
import { sileo } from 'sileo'

import { useAuthStore } from '@/entities/session'
import authService from '@/shared/api/services/auth.service'

import { loginSchema, type LoginFormValues } from './login.schema'
import { useLogin } from './useLogin'

export function useLoginForm() {
  const { mutate: login, isPending: isLoginPending } = useLogin()
  const { setTenantSlug } = useAuthStore()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  })

  const resolveTenant = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { slug } = await authService.resolveTenant(values.email)
      return { slug, values }
    },
    onSuccess: ({ slug, values }) => {
      setTenantSlug(slug)
      login({ email: values.email, password: values.password })
    },
    onError: () => {
      sileo.error({
        title: t('auth.toasts.workspaceNotFound'),
        description: t('auth.toasts.workspaceNotFoundDesc'),
      })
    },
  })

  return {
    control: form.control,
    handleSubmit: form.handleSubmit((values) => resolveTenant.mutate(values)),
    isPending: resolveTenant.isPending || isLoginPending,
  }
}
