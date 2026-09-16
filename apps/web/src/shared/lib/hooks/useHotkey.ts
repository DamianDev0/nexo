'use client'

import { useEffect } from 'react'

import { isEditableTarget, matchesShortcut } from '@/shared/lib/keyboard'

interface HotkeyOptions {
  readonly enabled?: boolean
  readonly allowInEditable?: boolean
  readonly skipEditable?: boolean
}

export function useHotkey(
  keys: readonly string[],
  onTrigger: (event: KeyboardEvent) => void,
  { enabled = true, allowInEditable = false, skipEditable = false }: Readonly<HotkeyOptions> = {},
): void {
  useEffect(() => {
    if (!enabled) return
    const handler = (event: KeyboardEvent) => {
      if (!matchesShortcut(event, keys)) return
      const hasModifier = event.metaKey || event.ctrlKey || event.altKey
      if (isEditableTarget(event.target) && (skipEditable || (!allowInEditable && !hasModifier)))
        return
      event.preventDefault()
      onTrigger(event)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, allowInEditable, skipEditable, keys, onTrigger])
}
