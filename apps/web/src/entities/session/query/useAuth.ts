'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import authService from '@/shared/api/services/auth.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { useAuthStore } from '../model/session.store'

const ME_STALE_MS = 5 * 60 * 1000

export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser)

  const query = useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: authService.me,
    retry: false,
    staleTime: ME_STALE_MS,
  })

  const me = query.data

  useEffect(() => {
    if (!me) return
    setUser({
      id: me.id,
      email: me.email,
      fullName: me.fullName,
      avatarUrl: me.avatarUrl,
      role: me.role,
      tenantId: me.tenantId,
      schemaName: me.schemaName,
    })
  }, [me, setUser])

  return query
}
