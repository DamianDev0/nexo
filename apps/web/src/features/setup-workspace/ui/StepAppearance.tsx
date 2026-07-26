import { useTranslation } from 'react-i18next'

import { FileUpload } from '@/shared/ui/molecules/file-upload'
import { Label } from '@/shared/ui/shadcn/label'

import { useGoogleFont } from '../model/useGoogleFont'

import { BrandColorSection } from './appearance/BrandColorSection'
import { BrandingFieldsSection } from './appearance/BrandingFieldsSection'
import { ModeSection } from './appearance/ModeSection'
import { ThemeColorsSection } from './appearance/ThemeColorsSection'
import { TypographySection } from './appearance/TypographySection'
import { AppearanceLivePreview } from './AppearanceLivePreview'
import { WizardStep, type WizardStepNav } from './WizardStep'

import type { AppearanceActions, AppearanceData } from '../model/appearance.types'

interface StepAppearanceProps {
  readonly data: AppearanceData
  readonly actions: AppearanceActions
  readonly nav: WizardStepNav
}

export function StepAppearance({ data, actions, nav }: Readonly<StepAppearanceProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.appearance'

  useGoogleFont(data.fontFamily)

  const preview = (
    <AppearanceLivePreview
      data={{
        colors: data.colors,
        darkMode: data.darkMode,
        fontFamily: data.fontFamily,
        borderRadius: data.borderRadius,
        density: data.density,
        productName: data.productName,
        logoPreview: data.logoPreview,
        navModules: data.navModules,
      }}
    />
  )

  return (
    <WizardStep
      header={{ badge: t(`${s}.badge`), title: t(`${s}.title`), description: t(`${s}.subtitle`) }}
      nav={{ ...nav, footerNote: t(`${s}.optionalNote`) }}
      aside={preview}
    >
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.logo`, 'Logo')}</Label>
        <FileUpload
          preview={data.logoPreview}
          fileName={data.logoFileName}
          onUpload={actions.onLogoUpload}
          onRemove={actions.onLogoRemove}
        />
      </div>

      <BrandColorSection
        primaryColor={data.primaryColor}
        grainIntensity={data.grainIntensity}
        onPrimaryColorChange={actions.onPrimaryColorChange}
        onGrainIntensityChange={actions.onGrainIntensityChange}
      />

      <ThemeColorsSection colors={data.colors} onColorOverride={actions.onColorOverride} />

      <TypographySection
        data={{
          fontFamily: data.fontFamily,
          borderRadius: data.borderRadius,
          density: data.density,
        }}
        actions={{
          onFontFamilyChange: actions.onFontFamilyChange,
          onBorderRadiusChange: actions.onBorderRadiusChange,
          onDensityChange: actions.onDensityChange,
        }}
      />

      <ModeSection darkMode={data.darkMode} onDarkModeChange={actions.onDarkModeChange} />

      <BrandingFieldsSection
        productName={data.productName}
        tagline={data.tagline}
        onProductNameChange={actions.onProductNameChange}
        onTaglineChange={actions.onTaglineChange}
      />
    </WizardStep>
  )
}
