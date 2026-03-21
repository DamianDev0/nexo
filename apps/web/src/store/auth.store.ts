import { create } from 'zustand'
import type { AuthenticatedUser } from '@repo/shared-types'

interface AuthState {
  user: AuthenticatedUser | null
  isAuthenticated: boolean
  setUser: (user: AuthenticatedUser) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}))
