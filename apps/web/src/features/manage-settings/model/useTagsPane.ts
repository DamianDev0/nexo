'use client'

import { taxonomyColorAt } from '@repo/shared-types'
import { useCallback, useMemo, useState } from 'react'

import { useTagsAdmin } from '../query/useTagsAdmin'

import type { TagRowActions } from './types'

export function useTagsPane() {
  const { tags, isPending, create, update, remove } = useTagsAdmin()
  const [newName, setNewName] = useState('')

  const actions: TagRowActions = useMemo(
    () => ({ onUpdate: update, onRemove: remove }),
    [update, remove],
  )

  const handleAdd = useCallback(() => {
    const name = newName.trim()
    if (!name) return
    create({ name, color: taxonomyColorAt(tags.length) })
    setNewName('')
  }, [create, newName, tags.length])

  return { tags, isPending, actions, newName, setNewName, handleAdd }
}

export type TagsPaneModel = ReturnType<typeof useTagsPane>
