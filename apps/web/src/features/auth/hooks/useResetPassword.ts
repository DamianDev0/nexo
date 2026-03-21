import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ROUTES } from '@/constants/routes.constants'
import authService from '@/core/services/auth.service'

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: (dto: { token: string; newPassword: string }) =>
      authService.resetPassword(dto.token, dto.newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully')
      router.push(ROUTES.auth.login)
    },
    onError: () => {
      toast.error('Invalid or expired reset token')
    },
  })
}
