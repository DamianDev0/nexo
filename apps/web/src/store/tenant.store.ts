import { create } from 'zustand'
import type { TenantTheme, TenantNomenclature } from '@repo/shared-types'

interface TenantState {
  productName: string
  theme: TenantTheme | null
  nomenclature: TenantNomenclature | null
  setProductName: (name: string) => void
  setTheme: (theme: TenantTheme) => void
  setNomenclature: (nomenclature: TenantNomenclature) => void
}

export const useTenantStore = create<TenantState>()((set) => ({
  productName: 'NexoCRM',
  theme: null,
  nomenclature: null,
  setProductName: (productName) => set({ productName }),
  setTheme: (theme) => set({ theme }),
  setNomenclature: (nomenclature) => set({ nomenclature }),
}))
