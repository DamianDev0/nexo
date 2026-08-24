import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { tenantRef } from '@/shared/api/tenant-ref'

interface AuthState {
  tenantSlug: string | null
  setTenantSlug: (slug: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tenantSlug: null,
      setTenantSlug: (slug) => {
        tenantRef.set(slug)
        set({ tenantSlug: slug })
      },
      clearSession: () => {
        tenantRef.set(null)
        set({ tenantSlug: null })
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
