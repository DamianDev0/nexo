import { useQuery } from '@tanstack/react-query'

import authService from '@/shared/api/services/auth.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { useAuthStore } from '../model/session.store'

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
