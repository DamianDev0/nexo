'use client'

import { useWatch } from 'react-hook-form'

import { TypographySection } from '@/features/setup-workspace'

import { useManageSettings } from '../../../model/settings-context'

export function TypographyPane() {
  const { control, bindField } = useManageSettings().appearance
  const fontFamily = useWatch({ control, name: 'fontFamily' })
  const borderRadius = useWatch({ control, name: 'borderRadius' })
  const density = useWatch({ control, name: 'density' })

  return (
    <TypographySection
      data={{ fontFamily, borderRadius, density }}
      actions={{
        onFontFamilyChange: bindField('fontFamily'),
        onBorderRadiusChange: bindField('borderRadius'),
        onDensityChange: bindField('density'),
      }}
    />
  )
}
