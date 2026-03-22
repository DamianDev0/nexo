import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sileo } from 'sileo'
import { useAuthStore } from '@/store/auth.store'
import authService from '@/core/services/auth.service'
import { useLogin } from './useLogin'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'

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
          title: 'Workspace not found',
          description: 'No workspace is associated with this email. Please check or sign up.',
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
