'use client'

import { useCallback, useMemo, useState } from 'react'

import { buildActivityType, withActivityPatch } from '../lib/activity-type-edit'
import { useActivityTypesAdmin } from '../query/useActivityTypesAdmin'

import type { ActivityTypeRowActions } from './types'
import type { ActivityTypeFormValues, ActivityTypePatch } from '../lib/activity-type-edit'

export function useActivityTypesPane() {
  const [creatorOpen, setCreatorOpen] = useState(false)
  const admin = useActivityTypesAdmin()
  const { types, update, remove } = admin

  const onPatch = useCallback(
    (key: string, patch: ActivityTypePatch) => {
      const def = types.find((type) => type.key === key)
      if (!def) return
      if (patch.label !== undefined && patch.label.trim().length === 0) return
      update(withActivityPatch(def, patch))
    },
    [types, update],
  )

  const onRemove = useCallback(
    (key: string) => {
      const def = types.find((type) => type.key === key)
      if (def && !def.isSystem) remove(key)
    },
    [types, remove],
  )

  const actions: ActivityTypeRowActions = useMemo(
    () => ({ onPatch, onRemove }),
    [onPatch, onRemove],
  )

  const onCreate = useCallback(
    (values: ActivityTypeFormValues) => {
      if (values.label.trim().length === 0) return
      admin.create(buildActivityType(values, types))
      setCreatorOpen(false)
    },
    [admin, types],
  )

  return {
    types,
    isPending: admin.isPending,
    actions,
    creator: {
      open: creatorOpen,
      onOpenChange: setCreatorOpen,
      openCreate: () => setCreatorOpen(true),
      onSubmit: onCreate,
    },
  }
}
