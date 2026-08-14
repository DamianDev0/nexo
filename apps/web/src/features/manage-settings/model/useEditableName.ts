'use client'

import { useState } from 'react'

interface UseEditableNameArgs {
  readonly value: string
  readonly onCommit: (name: string) => void
  readonly allowEmpty?: boolean
}

export function useEditableName({ value, onCommit, allowEmpty = false }: UseEditableNameArgs) {
  const [draft, setDraft] = useState(value)
  const [synced, setSynced] = useState(value)

  if (synced !== value) {
    setSynced(value)
    setDraft(value)
  }

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed === value) {
      setDraft(value)
      return
    }
    if (!trimmed && !allowEmpty) {
      setDraft(value)
      return
    }
    onCommit(trimmed)
  }

  return { name: draft, setName: setDraft, commit }
}
