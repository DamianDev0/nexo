import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { sileo } from 'sileo'
import { ROUTES } from '@/constants/routes.constants'
import authService from '@/core/services/auth.service'

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: (dto: { token: string; newPassword: string }) =>
      authService.resetPassword(dto.token, dto.newPassword),
    onSuccess: () => {
      sileo.success({ title: 'Password reset successfully' })
      router.push(ROUTES.auth.login)
    },
    onError: () => {
      sileo.error({ title: 'Reset failed', description: 'Invalid or expired reset token' })
    },
  })
}
