'use client'

import { useWatch } from 'react-hook-form'

import { useAppearanceColors, useActivePresetKey } from '../../model/useAppearanceDerived'
import { useSetupWizard } from '../../model/wizard-context'
import { StepAppearance } from '../StepAppearance'

export function AppearanceStep() {
  const { wizard, appearance, navigation } = useSetupWizard()
  const { control, bindField } = appearance
  const colors = useAppearanceColors(control)
  const activePresetKey = useActivePresetKey(control)
  const navModules = useWatch({ control: navigation.control, name: 'modules' })
  const [
    primaryColor,
    grainIntensity,
    darkMode,
    fontFamily,
    borderRadius,
    density,
    productName,
    tagline,
    logoPreview,
    logoFileName,
  ] = useWatch({
    control,
    name: [
      'primaryColor',
      'grainIntensity',
      'darkMode',
      'fontFamily',
      'borderRadius',
      'density',
      'productName',
      'tagline',
      'logoPreview',
      'logoFileName',
    ],
  })

  return (
    <StepAppearance
      data={{
        primaryColor,
        colors,
        grainIntensity,
        darkMode,
        fontFamily,
        borderRadius,
        density,
        productName,
        tagline,
        logoPreview,
        logoFileName,
        navModules,
        activePresetKey,
      }}
      actions={{
        onPrimaryColorChange: appearance.handlePrimaryChange,
        onColorOverride: appearance.handleColorOverride,
        onGrainIntensityChange: bindField('grainIntensity'),
        onDarkModeChange: bindField('darkMode'),
        onFontFamilyChange: bindField('fontFamily'),
        onBorderRadiusChange: bindField('borderRadius'),
        onDensityChange: bindField('density'),
        onProductNameChange: bindField('productName'),
        onTaglineChange: bindField('tagline'),
        onLogoUpload: appearance.handleLogoUpload,
        onLogoRemove: appearance.handleLogoRemove,
        onRestoreTheme: appearance.handleRestoreTheme,
        onApplyPreset: appearance.handleApplyPreset,
      }}
      nav={{
        onNext: appearance.handleSave,
        onBack: wizard.prevStep,
        isPending: appearance.isPending,
      }}
    />
  )
}
