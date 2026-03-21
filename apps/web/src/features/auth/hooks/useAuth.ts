import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { QUERY_KEYS } from '@/constants/query-keys.constants'
import authService from '@/core/services/auth.service'

export function useAuth() {
  const { setUser } = useAuthStore()

  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      const me = await authService.me()
      setUser({
        id: me.id,
        email: me.email,
        role: me.role,
        tenantId: me.tenantId,
        schemaName: me.schemaName,
      })
      return me
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
