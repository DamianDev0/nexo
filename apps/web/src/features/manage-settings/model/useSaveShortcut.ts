'use client'

import { useEffect, useState } from 'react'

interface SaveShortcut {
  readonly onSave: (() => void) | null
  readonly canSave: boolean
}

export function useSaveShortcut({ onSave, canSave }: Readonly<SaveShortcut>): void {
  useEffect(() => {
    if (!onSave) return

    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's') return
      event.preventDefault()
      if (canSave) onSave()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSave, canSave])
}

export function useSaveShortcutLabel(): string {
  const [label, setLabel] = useState('')

  useEffect(() => {
    setLabel(/mac/i.test(window.navigator.platform) ? '⌘S' : 'Ctrl+S')
  }, [])

  return label
}
