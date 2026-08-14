'use client'

import { SECTOR_OPTIONS } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { OptionTile } from '@/shared/ui/molecules/option-tile'
import { Label } from '@/shared/ui/shadcn/label'

import { SECTOR_ICONS } from '../config/company.constants'

import type { IndustrySector } from '@repo/shared-types'

interface SectorPickerProps {
  readonly value: IndustrySector | null
  readonly onSelect: (sector: IndustrySector) => void
}

export function SectorPicker({ value, onSelect }: Readonly<SectorPickerProps>) {
  const { t } = useTranslation()

  return (
    <div className="mt-6">
      <Label className="text-xs font-semibold text-body">
        {t('onboarding.steps.company.sector')}
      </Label>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5">
        {SECTOR_OPTIONS.map((opt) => {
          const Icon = SECTOR_ICONS[opt.id]
          return (
            <OptionTile
              key={opt.id}
              selected={value === opt.id}
              onSelect={() => onSelect(opt.id)}
              className="flex flex-col items-center p-3 text-center"
            >
              <Icon className="size-7 text-muted-foreground" />
              <div className="mt-1.5 text-xs font-semibold">
                {t(`sectors.${opt.id}`, { defaultValue: opt.label })}
              </div>
            </OptionTile>
          )
        })}
      </div>
    </div>
  )
}
