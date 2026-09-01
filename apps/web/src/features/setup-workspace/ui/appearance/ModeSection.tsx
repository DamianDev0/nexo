'use client'

import { THEME_MODE_OPTIONS } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { SegmentedControl } from '@/shared/ui/molecules/segmented-control'

import type { ThemeMode } from '../../model/types'

interface ModeSectionProps {
  readonly darkMode: ThemeMode
  readonly onDarkModeChange: (v: ThemeMode) => void
}

export function ModeSection({ darkMode, onDarkModeChange }: Readonly<ModeSectionProps>) {
  const { t } = useTranslation()

  return (
    <div className="px-4 py-4">
      <FieldLabel variant="section">{t('onboarding.steps.appearance.colorMode')}</FieldLabel>
      <SegmentedControl
        className="mt-2"
        value={darkMode}
        onValueChange={onDarkModeChange}
        options={THEME_MODE_OPTIONS.map((mode) => ({
          value: mode,
          label: <span className="capitalize">{mode}</span>,
        }))}
      />
    </div>
  )
}
