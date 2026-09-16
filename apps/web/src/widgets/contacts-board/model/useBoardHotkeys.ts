'use client'

import { SHORTCUTS } from '@/shared/config/shortcuts'
import { useHotkey } from '@/shared/lib/hooks/useHotkey'
import { isInsideOverlay } from '@/shared/lib/keyboard'

export type BoardSelectionHotkeys = {
  readonly active: boolean
  readonly pageSelected: boolean
  readonly selectPage: () => void
  readonly selectAll?: () => void
  readonly clear: () => void
}

type BoardHotkeys = {
  readonly onCreate: () => void
  readonly enabled: boolean
  readonly selection?: BoardSelectionHotkeys
}

export function useBoardHotkeys({ onCreate, enabled, selection }: BoardHotkeys): void {
  useHotkey(SHORTCUTS.newRecord, onCreate, { enabled })

  useHotkey(
    SHORTCUTS.selectAll,
    () => {
      if (!selection) return
      if (selection.pageSelected) selection.selectAll?.()
      else selection.selectPage()
    },
    { enabled: enabled && selection !== undefined, skipEditable: true },
  )

  useHotkey(
    SHORTCUTS.escape,
    (event) => {
      if (!isInsideOverlay(event.target)) selection?.clear()
    },
    { enabled: enabled && selection?.active === true },
  )
}
