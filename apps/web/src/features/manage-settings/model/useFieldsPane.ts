'use client'

import { useCallback, useMemo, useState } from 'react'

import { activeFields, buildFieldDef } from '../lib/custom-field-edit'
import { useCustomFieldsAdmin } from '../query/useCustomFieldsAdmin'

import type { CustomFieldEntity, CustomFieldType } from '@repo/shared-types'

export function useFieldsPane() {
  const [entity, setEntity] = useState<CustomFieldEntity>('contacts')
  const [editorOpen, setEditorOpen] = useState(false)
  const admin = useCustomFieldsAdmin(entity)

  const fields = useMemo(() => activeFields(admin.fields), [admin.fields])

  const onSubmit = useCallback(
    (values: { label: string; type: CustomFieldType }) => {
      admin.create(buildFieldDef(values.label, values.type, admin.fields))
      setEditorOpen(false)
    },
    [admin],
  )

  const onArchive = useCallback((key: string) => admin.archive(key), [admin])

  return {
    entity,
    setEntity,
    fields,
    isPending: admin.isPending,
    editor: { open: editorOpen, setOpen: setEditorOpen },
    onSubmit,
    onArchive,
  }
}
