'use client'

import { useTranslation } from 'react-i18next'

import {
  BrandColorSection,
  BrandingFieldsSection,
  PresetsSection,
} from '@/features/setup-workspace'
import { FileUpload } from '@/shared/ui/molecules/file-upload'
import { Label } from '@/shared/ui/shadcn/label'

import { useManageSettings } from '../../../model/settings-context'

export function BrandPane() {
  const { t } = useTranslation()
  const { appearance } = useManageSettings()

  return (
    <>
      <PresetsSection
        activePresetKey={appearance.activePresetKey}
        onApplyPreset={appearance.handleApplyPreset}
      />

      <div className="px-4 py-4">
        <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">
          {t('onboarding.steps.appearance.logo')}
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
  )
}
