import { act, renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { useFormFields } from '@/shared/lib/hooks/useFormFields'

interface Values {
  name: string
  count: number
}

function renderFields() {
  return renderHook(() => {
    const form = useForm<Values>({ defaultValues: { name: '', count: 0 } })
    return { form, ...useFormFields(form.setValue) }
  })
}

describe('useFormFields', () => {
  it('writes the value and marks the form dirty', () => {
    const { result } = renderFields()
    expect(result.current.form.formState.isDirty).toBe(false)

    act(() => result.current.setField('name', 'Ana'))

    expect(result.current.form.getValues('name')).toBe('Ana')
    expect(result.current.form.formState.isDirty).toBe(true)
  })

  it('binds a reusable handler per field', () => {
    const { result } = renderFields()

    act(() => result.current.bindField('count')(7))

    expect(result.current.form.getValues('count')).toBe(7)
  })

  it('returns the same handler identity for the same field', () => {
    const { result, rerender } = renderFields()
    const first = result.current.bindField('name')

    rerender()

    expect(result.current.bindField('name')).toBe(first)
  })

  it('returns different handlers for different fields', () => {
    const { result } = renderFields()

    expect(result.current.bindField('name')).not.toBe(result.current.bindField('count'))
  })
})
