import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthenticatedUser } from '@repo/shared-types'

interface AuthState {
  user: AuthenticatedUser | null
  tenantSlug: string | null
  isAuthenticated: boolean
  setUser: (user: AuthenticatedUser) => void
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
      setTenantSlug: (slug) => set({ tenantSlug: slug }),
      clearUser: () => set({ user: null, tenantSlug: null, isAuthenticated: false }),
    }),
    { name: 'nexo-auth' },
  ),
)
