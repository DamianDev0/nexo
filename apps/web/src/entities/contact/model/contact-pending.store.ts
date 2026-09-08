import { create } from 'zustand'

type PendingContactPatches = {
  readonly ids: ReadonlySet<string>
  readonly begin: (ids: ReadonlyArray<string>) => void
  readonly end: (ids: ReadonlyArray<string>) => void
}

const EMPTY: ReadonlySet<string> = new Set()

export const usePendingContactPatches = create<PendingContactPatches>()((set) => ({
  ids: EMPTY,
  begin: (ids) => set((state) => ({ ids: new Set([...state.ids, ...ids]) })),
  end: (ids) =>
    set((state) => {
      const next = new Set(state.ids)
      for (const id of ids) next.delete(id)
      return { ids: next.size === 0 ? EMPTY : next }
    }),
}))
