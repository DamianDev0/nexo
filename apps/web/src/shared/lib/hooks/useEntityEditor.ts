'use client'

import { useCallback, useState } from 'react'

export function useEntityEditor<T>() {
  const [editing, setEditing] = useState<T | null>(null)
  const [open, setOpen] = useState(false)

  const openCreate = useCallback(() => {
    setEditing(null)
    setOpen(true)
  }, [])

  const openEdit = useCallback((entity: T) => {
    setEditing(entity)
    setOpen(true)
  }, [])

  return { editing, open, setOpen, openCreate, openEdit }
}
