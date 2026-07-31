import { useMutation } from '@tanstack/react-query'
import { t } from 'i18next'
import { useRouter } from 'next/navigation'
import { sileo } from 'sileo'

import authService from '@/shared/api/services/auth.service'
import { ROUTES } from '@/shared/config/routes'

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: (dto: { token: string; newPassword: string }) =>
      authService.resetPassword(dto.token, dto.newPassword),
    onSuccess: () => {
      sileo.success({ title: t('auth.toasts.resetDone') })
      router.push(ROUTES.auth.login)
    },
    onError: () => {
      sileo.error({
        title: t('auth.toasts.resetFailed'),
        description: t('auth.toasts.resetTokenInvalid'),
      })
    },
  })
}
