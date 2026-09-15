export type ContactsTablePhase = 'pending' | 'unavailable' | 'empty' | 'rows'

type PhaseState = {
  readonly isPending: boolean
  readonly isUnavailable: boolean
  readonly isEmpty: boolean
}

export function resolveTablePhase(state: PhaseState): ContactsTablePhase {
  if (state.isPending) return 'pending'
  if (state.isUnavailable) return 'unavailable'
  if (state.isEmpty) return 'empty'
  return 'rows'
}
