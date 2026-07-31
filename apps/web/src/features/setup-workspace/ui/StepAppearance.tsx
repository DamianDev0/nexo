import { useTranslation } from 'react-i18next'

import { FileUpload } from '@/shared/ui/molecules/file-upload'
import { Label } from '@/shared/ui/shadcn/label'

import { useGoogleFont } from '../model/useGoogleFont'

import { BrandColorSection } from './appearance/BrandColorSection'
import { BrandingFieldsSection } from './appearance/BrandingFieldsSection'
import { ModeSection } from './appearance/ModeSection'
import { PresetsSection } from './appearance/PresetsSection'
import { ThemeColorsSection } from './appearance/ThemeColorsSection'
import { TypographySection } from './appearance/TypographySection'
import { AppearanceLivePreview } from './AppearanceLivePreview'
import { WizardStep, type WizardStepNav } from './WizardStep'

import type { AppearanceActions, AppearanceData } from '../model/types'

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
      asideProminent
    >
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <PresetsSection
          activePresetKey={data.activePresetKey}
          onApplyPreset={actions.onApplyPreset}
        />

        <div className="px-4 py-4">
          <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">
            {t(`${s}.logo`, 'Logo')}
          </Label>
          <FileUpload
            preview={data.logoPreview}
            fileName={data.logoFileName}
            onUpload={actions.onLogoUpload}
            onRemove={actions.onLogoRemove}
          />
        </div>

        <BrandingFieldsSection
          productName={data.productName}
          tagline={data.tagline}
          onProductNameChange={actions.onProductNameChange}
          onTaglineChange={actions.onTaglineChange}
        />

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
      </div>
    </WizardStep>
  )
}
