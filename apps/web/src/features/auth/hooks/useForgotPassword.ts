import { useMutation } from '@tanstack/react-query'
import { sileo } from 'sileo'
import authService from '@/core/services/auth.service'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSettled: () => {
      sileo.success({
        title: 'Check your email',
        description: 'If an account exists, a reset link has been sent',
      })
    },
  })
}
