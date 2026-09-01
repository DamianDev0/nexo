'use client'

import { SECTOR_OPTIONS } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { TileRadioGroup } from '@/shared/ui/molecules/tile-radio-group'

import { SECTOR_ICONS } from '../config/company.constants'

import type { IndustrySector } from '@repo/shared-types'

interface SectorPickerProps {
  readonly value: IndustrySector | null
  readonly onSelect: (sector: IndustrySector) => void
}

export function SectorPicker({ value, onSelect }: Readonly<SectorPickerProps>) {
  const { t } = useTranslation()

  const options = SECTOR_OPTIONS.map((opt) => {
    const Icon = SECTOR_ICONS[opt.id]
    return {
      value: opt.id,
      content: (
        <>
          <Icon className="size-7 text-muted-foreground" />
          <div className="mt-1.5 text-xs font-semibold">
            {t(`sectors.${opt.id}`, { defaultValue: opt.label })}
          </div>
        </>
      ),
    }
  })

  return (
    <div className="mt-6">
      <FieldLabel>{t('onboarding.steps.company.sector')}</FieldLabel>
      <div className="mt-3">
        <TileRadioGroup
          value={value}
          onChange={onSelect}
          options={options}
          label={t('onboarding.steps.company.sector')}
          classes={{
            group: 'grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5',
            tile: 'flex flex-col items-center p-3 text-center',
          }}
        />
      </div>
    </div>
  )
}
