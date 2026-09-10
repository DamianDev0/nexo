'use client'

import { SHORTCUTS } from '@/shared/config/shortcuts'
import { useHotkey } from '@/shared/lib/hooks/useHotkey'

type BoardHotkeys = {
  readonly onCreate: () => void
  readonly enabled: boolean
}

export function useBoardHotkeys({ onCreate, enabled }: BoardHotkeys): void {
  useHotkey(SHORTCUTS.newRecord, onCreate, { enabled })
}
