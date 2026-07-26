import { useSetupWizard } from '../../model/wizard-context'
import { StepAppearance } from '../StepAppearance'

export function AppearanceStep() {
  const { wizard, appearance, navigation } = useSetupWizard()

  return (
    <StepAppearance
      data={{
        primaryColor: appearance.primaryColor,
        colors: appearance.colors,
        grainIntensity: appearance.grainIntensity,
        darkMode: appearance.darkMode,
        fontFamily: appearance.fontFamily,
        borderRadius: appearance.borderRadius,
        density: appearance.density,
        productName: appearance.productName,
        tagline: appearance.tagline,
        logoPreview: appearance.logoPreview,
        logoFileName: appearance.logoFileName,
        navModules: navigation.modules,
      }}
      actions={{
        onPrimaryColorChange: appearance.handlePrimaryChange,
        onColorOverride: appearance.handleColorOverride,
        onGrainIntensityChange: appearance.setGrainIntensity,
        onDarkModeChange: appearance.setDarkMode,
        onFontFamilyChange: appearance.setFontFamily,
        onBorderRadiusChange: appearance.setBorderRadius,
        onDensityChange: appearance.setDensity,
        onProductNameChange: appearance.setProductName,
        onTaglineChange: appearance.setTagline,
        onLogoUpload: appearance.handleLogoUpload,
        onLogoRemove: appearance.handleLogoRemove,
        onRestoreTheme: appearance.handleRestoreTheme,
      }}
      nav={{
        onNext: appearance.handleSave,
        onBack: wizard.prevStep,
        isPending: appearance.isPending,
      }}
    />
  )
}
