'use client'

import { ModeSection, ThemeColorsSection } from '@/features/setup-workspace'

import { useManageSettings } from '../../../model/settings-context'

export function ThemePane() {
  const { appearance } = useManageSettings()

  return (
    <>
      <ThemeColorsSection
        colors={appearance.colors}
        onColorOverride={appearance.handleColorOverride}
      />
      <ModeSection darkMode={appearance.darkMode} onDarkModeChange={appearance.setDarkMode} />
    </>
  )
}
