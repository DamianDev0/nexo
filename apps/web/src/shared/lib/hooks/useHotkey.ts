'use client'

import { useEffect } from 'react'

import { isEditableTarget, matchesShortcut } from '@/shared/lib/keyboard'

interface HotkeyOptions {
  readonly enabled?: boolean
  readonly allowInEditable?: boolean
}

export function useHotkey(
  keys: readonly string[],
  onTrigger: (event: KeyboardEvent) => void,
  { enabled = true, allowInEditable = false }: Readonly<HotkeyOptions> = {},
): void {
  useEffect(() => {
    if (!enabled) return
    const handler = (event: KeyboardEvent) => {
      if (!matchesShortcut(event, keys)) return
      const hasModifier = event.metaKey || event.ctrlKey || event.altKey
      if (!allowInEditable && !hasModifier && isEditableTarget(event.target)) return
      event.preventDefault()
      onTrigger(event)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, allowInEditable, keys, onTrigger])
}
