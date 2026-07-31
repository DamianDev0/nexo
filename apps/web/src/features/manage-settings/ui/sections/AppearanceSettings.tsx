'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  AppearanceLivePreview,
  BrandColorSection,
  BrandingFieldsSection,
  ModeSection,
  PresetsSection,
  ThemeColorsSection,
  TypographySection,
  useGoogleFont,
} from '@/features/setup-workspace'
import { FileUpload } from '@/shared/ui/molecules/file-upload'
import { SectionTabs } from '@/shared/ui/molecules/section-tabs'
import { Label } from '@/shared/ui/shadcn/label'

import { buildAppearanceTabs, type AppearanceTabKey } from '../../config/appearance-tabs'
import { useManageSettings } from '../../model/settings-context'

export function AppearanceSettings() {
  const { t } = useTranslation()
  const { appearance, navigation } = useManageSettings()
  const [tab, setTab] = useState<AppearanceTabKey>('brand')
  const tabs = useMemo(() => buildAppearanceTabs(t), [t])

  useGoogleFont(appearance.fontFamily)

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
      <div className="w-full xl:max-w-sm">
        <SectionTabs tabs={tabs} active={tab} onChange={(key) => setTab(key as AppearanceTabKey)} />

        <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          {tab === 'brand' && (
            <>
              <PresetsSection
                activePresetKey={appearance.activePresetKey}
                onApplyPreset={appearance.handleApplyPreset}
              />

              <div className="px-4 py-4">
                <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                  {t('onboarding.steps.appearance.logo', 'Logo')}
                </Label>
                <FileUpload
                  preview={appearance.logoPreview}
                  fileName={appearance.logoFileName}
                  onUpload={appearance.handleLogoUpload}
                  onRemove={appearance.handleLogoRemove}
                />
              </div>

              <BrandingFieldsSection
                productName={appearance.productName}
                tagline={appearance.tagline}
                onProductNameChange={appearance.setProductName}
                onTaglineChange={appearance.setTagline}
              />

              <BrandColorSection
                primaryColor={appearance.primaryColor}
                grainIntensity={appearance.grainIntensity}
                onPrimaryColorChange={appearance.handlePrimaryChange}
                onGrainIntensityChange={appearance.setGrainIntensity}
              />
            </>
          )}

          {tab === 'theme' && (
            <>
              <ThemeColorsSection
                colors={appearance.colors}
                onColorOverride={appearance.handleColorOverride}
              />
              <ModeSection
                darkMode={appearance.darkMode}
                onDarkModeChange={appearance.setDarkMode}
              />
            </>
          )}

          {tab === 'typography' && (
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
          )}
        </div>
      </div>

      <div className="w-full xl:sticky xl:top-6 xl:flex-1 xl:self-start">
        <AppearanceLivePreview
          data={{
            colors: appearance.colors,
            darkMode: appearance.darkMode,
            fontFamily: appearance.fontFamily,
            borderRadius: appearance.borderRadius,
            density: appearance.density,
            productName: appearance.productName,
            logoPreview: appearance.logoPreview,
            navModules: navigation.modules,
          }}
        />
      </div>
    </div>
  )
}
