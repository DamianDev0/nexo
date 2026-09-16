export type ContactsTablePhase = 'pending' | 'unavailable' | 'failed' | 'empty' | 'rows'

type PhaseState = {
  readonly isPending: boolean
  readonly isUnavailable: boolean
  readonly isFailed: boolean
  readonly isEmpty: boolean
}

export function resolveTablePhase(state: PhaseState): ContactsTablePhase {
  if (state.isPending) return 'pending'
  if (state.isUnavailable) return 'unavailable'
  if (state.isFailed) return 'failed'
  if (state.isEmpty) return 'empty'
  return 'rows'
}
