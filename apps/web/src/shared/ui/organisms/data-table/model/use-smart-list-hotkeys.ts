'use client'

import { useEffect } from 'react'

const MAX_HOTKEYS = 9

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  )
}

export function useSmartListHotkeys(
  ids: ReadonlyArray<string>,
  onSelect: (id: string) => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
      if (isTypingTarget(event.target)) return
      const index = Number.parseInt(event.key, 10)
      if (Number.isNaN(index) || index < 1 || index > Math.min(ids.length, MAX_HOTKEYS)) return
      const id = ids[index - 1]
      if (id === undefined) return
      event.preventDefault()
      onSelect(id)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ids, onSelect, enabled])
}
