'use client'

import { useTranslation } from 'react-i18next'

import { SectorPicker } from '@/features/setup-workspace'
import { Input } from '@/shared/ui/shadcn/input'
import { Label } from '@/shared/ui/shadcn/label'

import { useManageSettings } from '../../model/settings-context'

export function GeneralSettings() {
  const { t } = useTranslation()
  const s = 'onboarding.steps.company'
  const { company } = useManageSettings()

  return (
    <div className="max-w-5xl">
      <div className="grid gap-4 sm:grid-cols-2">
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

      <SectorPicker value={company.sector} onSelect={company.setSector} />
    </div>
  )
}
