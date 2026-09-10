import { create } from 'zustand'

type BreadcrumbTail = {
  readonly label: string | null
  readonly setLabel: (label: string | null) => void
}

export const useBreadcrumbTailStore = create<BreadcrumbTail>()((set) => ({
  label: null,
  setLabel: (label) => set({ label }),
}))
