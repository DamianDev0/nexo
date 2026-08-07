'use client'

import { useState } from 'react'

export function useEditableName(current: string, onCommit: (name: string) => void) {
  const [name, setName] = useState(current)

  const commit = () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === current) {
      setName(current)
      return
    }
    onCommit(trimmed)
  }

  return { name, setName, commit }
}
