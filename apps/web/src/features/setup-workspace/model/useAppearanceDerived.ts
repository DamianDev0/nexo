'use client'

import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import { matchingPresetKey } from '../lib/appearance'
import { derivePalette } from '../lib/palette'

import type { AppearanceFormValues } from './types'
import type { Control } from 'react-hook-form'

export function useAppearanceColors(control: Control<AppearanceFormValues>) {
  const primaryColor = useWatch({ control, name: 'primaryColor' })
  const colorOverrides = useWatch({ control, name: 'colorOverrides' })

  return useMemo(() => derivePalette(primaryColor, colorOverrides), [primaryColor, colorOverrides])
}

export function useActivePresetKey(control: Control<AppearanceFormValues>) {
  const primaryColor = useWatch({ control, name: 'primaryColor' })
  const fontFamily = useWatch({ control, name: 'fontFamily' })
  const borderRadius = useWatch({ control, name: 'borderRadius' })
  const density = useWatch({ control, name: 'density' })

  return useMemo(
    () => matchingPresetKey({ primaryColor, fontFamily, borderRadius, density }),
    [primaryColor, fontFamily, borderRadius, density],
  )
}
