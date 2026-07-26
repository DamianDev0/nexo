import { useMutation } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import authService from '@/shared/api/services/auth.service'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSettled: () => {
      sileo.success({
        title: t('auth.toasts.checkEmail'),
        description: t('auth.toasts.resetSent'),
      })
    },
  })
}
