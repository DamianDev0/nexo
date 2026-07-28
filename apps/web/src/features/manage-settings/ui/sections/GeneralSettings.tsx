'use client'

import { SECTOR_OPTIONS } from '@repo/shared-utils'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import { SECTOR_ICON_SRC } from '@/features/setup-workspace'
import { OptionTile } from '@/shared/ui/molecules/option-tile'
import { Input } from '@/shared/ui/shadcn/input'
import { Label } from '@/shared/ui/shadcn/label'

import { useManageSettings } from '../../model/settings-context'
import { SaveBar } from '../SaveBar'

export function GeneralSettings() {
  const { t } = useTranslation()
  const s = 'onboarding.steps.company'
  const { company } = useManageSettings()

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">{t(`${s}.phone`)}</Label>
          <Input
            className="mt-1.5 h-9 text-sm"
            placeholder="601 234 5678"
            inputMode="tel"
            value={company.phone}
            onChange={(e) => company.setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t(`${s}.website`)}</Label>
          <Input
            className="mt-1.5 h-9 text-sm"
            placeholder="https://yourcompany.com"
            value={company.website}
            onChange={(e) => company.setWebsite(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-xs text-muted-foreground">{t(`${s}.sector`)}</Label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {SECTOR_OPTIONS.map((opt) => (
            <OptionTile
              key={opt.id}
              selected={company.sector === opt.id}
              onSelect={() => company.setSector(opt.id)}
              className="flex flex-col items-center p-3 text-center"
            >
              <Image
                src={SECTOR_ICON_SRC[opt.id]}
                alt=""
                width={36}
                height={36}
                className="size-9 drop-shadow-sm"
              />
              <div className="mt-1.5 text-xs font-semibold">{opt.label}</div>
            </OptionTile>
          ))}
        </div>
      </div>

      <SaveBar onSave={company.handleSave} isPending={company.isPending} />
    </div>
  )
}
