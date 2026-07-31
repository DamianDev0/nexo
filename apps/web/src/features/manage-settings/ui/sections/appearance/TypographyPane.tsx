'use client'

import { TypographySection } from '@/features/setup-workspace'

import { useManageSettings } from '../../../model/settings-context'

export function TypographyPane() {
  const { appearance } = useManageSettings()

  return (
    <TypographySection
      data={{
        fontFamily: appearance.fontFamily,
        borderRadius: appearance.borderRadius,
        density: appearance.density,
      }}
      actions={{
        onFontFamilyChange: appearance.setFontFamily,
        onBorderRadiusChange: appearance.setBorderRadius,
        onDensityChange: appearance.setDensity,
      }}
    />
  )
}
