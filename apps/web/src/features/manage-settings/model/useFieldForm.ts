'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { fieldHasOptions } from '../lib/custom-field-edit'

import type { FieldFormValues } from '../lib/custom-field-edit'
import type { CustomFieldType } from '@repo/shared-types'

export type FieldOptionItem = { id: string; value: string }

function seedOptions(labels: ReadonlyArray<string>): FieldOptionItem[] {
  return labels.map((value, index) => ({ id: `seed-${index}`, value }))
}

export function useFieldForm(initial: FieldFormValues | null) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [type, setType] = useState<CustomFieldType>(initial?.type ?? 'text')
  const [required, setRequired] = useState(initial?.required ?? false)
  const [showInForm, setShowInForm] = useState(initial?.showInForm ?? true)
  const [options, setOptions] = useState<FieldOptionItem[]>(() =>
    seedOptions(initial?.optionLabels ?? []),
  )
  const nextId = useRef(0)

  const addOption = useCallback(() => {
    nextId.current += 1
    setOptions((current) => [...current, { id: `new-${nextId.current}`, value: '' }])
  }, [])

  const changeOption = useCallback((id: string, value: string) => {
    setOptions((current) => current.map((item) => (item.id === id ? { ...item, value } : item)))
  }, [])

  const removeOption = useCallback((id: string) => {
    setOptions((current) => current.filter((item) => item.id !== id))
  }, [])

  const optionLabels = useMemo(
    () => options.map((item) => item.value.trim()).filter(Boolean),
    [options],
  )

  const hasOptions = fieldHasOptions(type)
  const canSubmit = Boolean(label.trim()) && (!hasOptions || optionLabels.length > 0)

  const values = useCallback(
    (): FieldFormValues => ({ label, type, required, showInForm, optionLabels }),
    [label, optionLabels, required, showInForm, type],
  )

  return {
    label,
    setLabel,
    type,
    setType,
    required,
    setRequired,
    showInForm,
    setShowInForm,
    hasOptions,
    options,
    optionActions: { onAdd: addOption, onChange: changeOption, onRemove: removeOption },
    canSubmit,
    values,
    isEdit: initial !== null,
  }
}
