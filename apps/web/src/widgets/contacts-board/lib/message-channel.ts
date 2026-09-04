import type { ActiveComposer } from '../model/useContactComposers'
import type { MessageChannel } from '@/features/compose-message'

export function resolveMessageChannel(active: ActiveComposer | null): MessageChannel | null {
  if (!active || active.kind === 'note' || active.kind === 'tags') return null
  return active.kind
}
