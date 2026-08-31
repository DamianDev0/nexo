'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  activeFields,
  buildFieldDef,
  fieldPatch,
  reorderFieldDefs,
  toFormValues,
} from '../lib/custom-field-edit'
import { useCustomFieldsAdmin } from '../query/useCustomFieldsAdmin'

import type { FieldFormValues } from '../lib/custom-field-edit'
import type { CustomFieldEntity } from '@repo/shared-types'

export function useFieldsPane() {
  const [entity, setEntity] = useState<CustomFieldEntity>('contacts')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const admin = useCustomFieldsAdmin(entity)

  const fields = useMemo(() => activeFields(admin.fields), [admin.fields])
  const editingField = fields.find((field) => field.key === editingKey) ?? null

  const changeEntity = useCallback((next: CustomFieldEntity) => {
    setEntity(next)
    setEditingKey(null)
  }, [])

  const openCreate = useCallback(() => {
    setEditingKey(null)
    setEditorOpen(true)
  }, [])

  const openEdit = useCallback((key: string) => {
    setEditingKey(key)
    setEditorOpen(true)
  }, [])

  const closeEditor = useCallback((open: boolean) => {
    setEditorOpen(open)
    if (!open) setEditingKey(null)
  }, [])

  const onSubmit = useCallback(
    (values: FieldFormValues) => {
      if (editingField) {
        admin.patch({ key: editingField.key, data: fieldPatch(editingField, values) })
      } else {
        admin.create(buildFieldDef(values, admin.fields))
      }
      closeEditor(false)
    },
    [admin, closeEditor, editingField],
  )

  const onReorder = useCallback(
    (fromKey: string, toKey: string) => {
      admin.replace(reorderFieldDefs(admin.fields, fromKey, toKey))
    },
    [admin],
  )

  const onArchive = useCallback((key: string) => admin.archive(key), [admin])

  const rowActions = useMemo(() => ({ onEdit: openEdit, onArchive }), [onArchive, openEdit])

  return {
    rowActions,
    entity,
    setEntity: changeEntity,
    fields,
    isPending: admin.isPending,
    editor: {
      open: editorOpen,
      initial: editingField ? toFormValues(editingField) : null,
      setOpen: closeEditor,
      openCreate,
    },
    onSubmit,
    onEdit: openEdit,
    onReorder,
    onArchive,
  }
}
