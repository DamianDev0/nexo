import { SHORTCUTS } from '@/shared/config/shortcuts'

import type { ShortcutId } from '@/shared/config/shortcuts'

export const SHORTCUT_HELP_KEY = ['?'] as const

export type ShortcutGroup = {
  readonly id: string
  readonly shortcuts: ReadonlyArray<ShortcutId>
}

export const SHORTCUT_GROUPS: ReadonlyArray<ShortcutGroup> = [
  { id: 'global', shortcuts: ['commandMenu', 'globalSearch', 'escape'] },
  { id: 'records', shortcuts: ['newRecord', 'nextItem', 'previousItem'] },
  { id: 'editing', shortcuts: ['save', 'bold', 'italic', 'underline'] },
]

export function shortcutKeys(id: ShortcutId): ReadonlyArray<string> {
  return SHORTCUTS[id]
}
