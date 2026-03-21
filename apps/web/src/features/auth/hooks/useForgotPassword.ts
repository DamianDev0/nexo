import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import authService from '@/core/services/auth.service'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSettled: () => {
      toast.success('If an account exists with that email, a reset link has been sent')
    },
  })
}
