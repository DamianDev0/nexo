'use client'

import { useWatch } from 'react-hook-form'

import { ModeSection, ThemeColorsSection, useAppearanceColors } from '@/features/setup-workspace'

import { useManageSettings } from '../../../model/settings-context'

export function ThemePane() {
  const { control, bindField, handleColorOverride } = useManageSettings().appearance
  const colors = useAppearanceColors(control)
  const darkMode = useWatch({ control, name: 'darkMode' })

  return (
    <>
      <ThemeColorsSection colors={colors} onColorOverride={handleColorOverride} />
      <ModeSection darkMode={darkMode} onDarkModeChange={bindField('darkMode')} />
    </>
  )
}
