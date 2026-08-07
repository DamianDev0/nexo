import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { tenantRef } from '@/shared/api/tenant-ref'

import type { SessionUser } from './types/session.types'

interface AuthState {
  user: SessionUser | null
  tenantSlug: string | null
  isAuthenticated: boolean
  setUser: (user: SessionUser) => void
  setTenantSlug: (slug: string) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenantSlug: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setTenantSlug: (slug) => {
        tenantRef.set(slug)
        set({ tenantSlug: slug })
      },
      clearUser: () => {
        tenantRef.set(null)
        set({ user: null, tenantSlug: null, isAuthenticated: false })
      },
    }),
    {
      name: 'nexo-auth',
      partialize: (state) => ({ tenantSlug: state.tenantSlug }),
      onRehydrateStorage: () => (state) => {
        tenantRef.set(state?.tenantSlug ?? null)
      },
    },
  ),
)
