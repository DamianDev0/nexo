import { zodResolver } from '@hookform/resolvers/zod'
import { t } from 'i18next'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { sileo } from 'sileo'

import { useAuthStore } from '@/entities/session'
import authService from '@/shared/api/services/auth.service'

import { loginSchema, type LoginFormValues } from './login.schema'
import { useLogin } from './useLogin'

export function useLoginForm() {
  const { mutate: login, isPending: isLoginPending } = useLogin()
  const { setTenantSlug } = useAuthStore()
  const [isResolving, setIsResolving] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  })

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setIsResolving(true)
      try {
        const { slug } = await authService.resolveTenant(values.email)
        setTenantSlug(slug)
        login({ email: values.email, password: values.password })
      } catch {
        sileo.error({
          title: t('auth.toasts.workspaceNotFound'),
          description: t('auth.toasts.workspaceNotFoundDesc'),
        })
      } finally {
        setIsResolving(false)
      }
    },
    [login, setTenantSlug],
  )

  return {
    control: form.control,
    handleSubmit: form.handleSubmit(onSubmit),
    isPending: isResolving || isLoginPending,
  }
}
