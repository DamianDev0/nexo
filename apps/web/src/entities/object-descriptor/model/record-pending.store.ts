import { create } from 'zustand'

import { pendingCellToken } from '../lib/record-pending-cells'

export type PendingRecordPatch = {
  readonly id: string
  readonly keys: ReadonlyArray<string>
}

type PendingRecordPatches = {
  readonly ids: ReadonlySet<string>
  readonly cells: ReadonlySet<string>
  readonly begin: (patches: ReadonlyArray<PendingRecordPatch>) => void
  readonly end: (ids: ReadonlyArray<string>) => void
}

const EMPTY: ReadonlySet<string> = new Set()

function compact(set: Set<string>): ReadonlySet<string> {
  return set.size === 0 ? EMPTY : set
}

export const usePendingRecordPatches = create<PendingRecordPatches>()((set) => ({
  ids: EMPTY,
  cells: EMPTY,
  begin: (patches) =>
    set((state) => ({
      ids: new Set([...state.ids, ...patches.map((patch) => patch.id)]),
      cells: new Set([
        ...state.cells,
        ...patches.flatMap((patch) => patch.keys.map((key) => pendingCellToken(patch.id, key))),
      ]),
    })),
  end: (ids) =>
    set((state) => {
      const gone = new Set(ids)
      const nextIds = new Set([...state.ids].filter((id) => !gone.has(id)))
      const nextCells = new Set(
        [...state.cells].filter((token) => !gone.has(token.slice(0, token.indexOf(':')))),
      )
      return { ids: compact(nextIds), cells: compact(nextCells) }
    }),
}))
