import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useFieldForm } from '@/features/manage-settings/model/useFieldForm'

describe('useFieldForm', () => {
  it('starts empty in create mode', () => {
    const { result } = renderHook(() => useFieldForm(null))

    expect(result.current.isEdit).toBe(false)
    expect(result.current.label).toBe('')
    expect(result.current.type).toBe('text')
    expect(result.current.canSubmit).toBe(false)
  })

  it('seeds state from the edited field', () => {
    const { result } = renderHook(() =>
      useFieldForm({
        label: 'Tipo de techo',
        type: 'select',
        required: true,
        showInForm: false,
        optionLabels: ['Teja'],
      }),
    )

    expect(result.current.isEdit).toBe(true)
    expect(result.current.required).toBe(true)
    expect(result.current.showInForm).toBe(false)
    expect(result.current.hasOptions).toBe(true)
    expect(result.current.options.map((option) => option.value)).toEqual(['Teja'])
  })

  it('requires at least one option for select fields', () => {
    const { result } = renderHook(() => useFieldForm(null))

    act(() => result.current.setLabel('Techo'))
    act(() => result.current.setType('select'))
    expect(result.current.canSubmit).toBe(false)

    act(() => result.current.optionActions.onAdd())
    const added = result.current.options[0]!
    act(() => result.current.optionActions.onChange(added.id, 'Teja'))

    expect(result.current.canSubmit).toBe(true)
    expect(result.current.values().optionLabels).toEqual(['Teja'])
  })

  it('adds, edits and removes options by stable id', () => {
    const { result } = renderHook(() => useFieldForm(null))

    act(() => result.current.optionActions.onAdd())
    act(() => result.current.optionActions.onAdd())
    const [first, second] = result.current.options
    act(() => result.current.optionActions.onChange(first!.id, 'Uno'))
    act(() => result.current.optionActions.onChange(second!.id, 'Dos'))
    act(() => result.current.optionActions.onRemove(first!.id))

    expect(result.current.options.map((option) => option.value)).toEqual(['Dos'])
  })

  it('collects trimmed non-empty option labels into values()', () => {
    const { result } = renderHook(() =>
      useFieldForm({
        label: 'Techo',
        type: 'multiselect',
        required: false,
        showInForm: true,
        optionLabels: [],
      }),
    )

    act(() => result.current.optionActions.onAdd())
    act(() => result.current.optionActions.onAdd())
    const [first] = result.current.options
    act(() => result.current.optionActions.onChange(first!.id, '  Teja  '))

    expect(result.current.values()).toEqual({
      label: 'Techo',
      type: 'multiselect',
      required: false,
      showInForm: true,
      optionLabels: ['Teja'],
    })
  })
})
