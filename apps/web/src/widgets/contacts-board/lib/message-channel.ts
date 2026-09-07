import { MESSAGE_CHANNELS } from '@/features/compose-message'

import type { ActiveComposer } from '../model/useContactComposers'
import type { ContactLogKind } from '@/entities/contact'
import type { MessageChannel } from '@/features/compose-message'

const LOG_KINDS: ReadonlyArray<ContactLogKind> = ['task', 'meeting']

export function resolveMessageChannel(active: ActiveComposer | null): MessageChannel | null {
  if (!active) return null
  const channel = MESSAGE_CHANNELS.find((candidate) => candidate === active.kind)
  return channel ?? null
}

export function resolveLogKind(active: ActiveComposer | null): ContactLogKind | null {
  if (!active) return null
  return LOG_KINDS.find((kind) => kind === active.kind) ?? null
}
