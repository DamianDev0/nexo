import { act, renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { AppearanceFormValues } from '@/features/setup-workspace/model/types'

import {
  APPEARANCE_DEFAULT_VALUES,
  THEME_PRESETS,
} from '@/features/setup-workspace/config/appearance.constants'
import {
  useActivePresetKey,
  useAppearanceColors,
} from '@/features/setup-workspace/model/useAppearanceDerived'

function renderDerived() {
  return renderHook(() => {
    const form = useForm<AppearanceFormValues>({ defaultValues: APPEARANCE_DEFAULT_VALUES })
    return {
      form,
      colors: useAppearanceColors(form.control),
      activePresetKey: useActivePresetKey(form.control),
    }
  })
}

describe('useAppearanceColors', () => {
  it('derives the palette from the primary colour', () => {
    const { result } = renderDerived()

    expect(result.current.colors.primary).toBe(APPEARANCE_DEFAULT_VALUES.primaryColor)
  })

  it('recomputes when the primary colour changes', () => {
    const { result } = renderDerived()
    const before = result.current.colors.primary

    act(() => result.current.form.setValue('primaryColor', '#123456'))

    expect(result.current.colors.primary).toBe('#123456')
    expect(result.current.colors.primary).not.toBe(before)
  })

  it('lets an explicit override win over the derived value', () => {
    const { result } = renderDerived()

    act(() => result.current.form.setValue('colorOverrides', { accent: '#ABCDEF' }))

    expect(result.current.colors.accent).toBe('#ABCDEF')
  })

  it('keeps the same object identity while no watched field changes', () => {
    const { result, rerender } = renderDerived()
    const first = result.current.colors

    rerender()

    expect(result.current.colors).toBe(first)
  })
})

describe('useActivePresetKey', () => {
  it('matches the preset whose values the form currently holds', () => {
    const preset = THEME_PRESETS.find((candidate) => candidate.key === 'midnight')
    if (!preset) throw new Error('missing midnight preset')

    const { result } = renderDerived()

    act(() => {
      result.current.form.setValue('primaryColor', preset.primary)
      result.current.form.setValue('fontFamily', preset.fontFamily)
      result.current.form.setValue('borderRadius', preset.borderRadius)
      result.current.form.setValue('density', preset.density)
    })

    expect(result.current.activePresetKey).toBe('midnight')
  })

  it('reports no preset once a value drifts away from every preset', () => {
    const { result } = renderDerived()

    act(() => result.current.form.setValue('primaryColor', '#010203'))

    expect(result.current.activePresetKey).toBeNull()
  })
})
