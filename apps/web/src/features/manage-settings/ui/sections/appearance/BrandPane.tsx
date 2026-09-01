'use client'

import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  BrandColorSection,
  BrandingFieldsSection,
  PresetsSection,
  useActivePresetKey,
} from '@/features/setup-workspace'
import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { FileUpload } from '@/shared/ui/molecules/file-upload'

import { useManageSettings } from '../../../model/settings-context'

export function BrandPane() {
  const { t } = useTranslation()
  const { appearance } = useManageSettings()
  const { control, bindField } = appearance
  const activePresetKey = useActivePresetKey(control)
  const primaryColor = useWatch({ control, name: 'primaryColor' })
  const grainIntensity = useWatch({ control, name: 'grainIntensity' })
  const productName = useWatch({ control, name: 'productName' })
  const tagline = useWatch({ control, name: 'tagline' })
  const logoPreview = useWatch({ control, name: 'logoPreview' })
  const logoFileName = useWatch({ control, name: 'logoFileName' })

  return (
    <>
      <PresetsSection
        activePresetKey={activePresetKey}
        onApplyPreset={appearance.handleApplyPreset}
      />

      <div className="px-4 py-4">
        <FieldLabel variant="section">{t('onboarding.steps.appearance.logo')}</FieldLabel>
        <FileUpload
          preview={logoPreview}
          fileName={logoFileName}
          onUpload={appearance.handleLogoUpload}
          onRemove={appearance.handleLogoRemove}
        />
      </div>

      <BrandingFieldsSection
        productName={productName}
        tagline={tagline}
        onProductNameChange={bindField('productName')}
        onTaglineChange={bindField('tagline')}
      />

      <BrandColorSection
        primaryColor={primaryColor}
        grainIntensity={grainIntensity}
        onPrimaryColorChange={appearance.handlePrimaryChange}
        onGrainIntensityChange={bindField('grainIntensity')}
      />
    </>
  )
}
