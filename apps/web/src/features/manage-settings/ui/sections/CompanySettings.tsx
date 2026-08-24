'use client'

import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { SectorPicker } from '@/features/setup-workspace'
import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { useManageSettings } from '../../model/settings-context'

export function CompanySettings() {
  const { t } = useTranslation()
  const s = 'onboarding.steps.company'
  const { control, bindField } = useManageSettings().company
  const phone = useWatch({ control, name: 'phone' })
  const website = useWatch({ control, name: 'website' })
  const sector = useWatch({ control, name: 'sector' })
  const setPhone = bindField('phone')
  const setWebsite = bindField('website')

  return (
    <div className="max-w-5xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>{t(`${s}.phone`)}</FieldLabel>
          <Input
            className="mt-1.5 h-9 text-sm"
            placeholder="601 234 5678"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>{t(`${s}.website`)}</FieldLabel>
          <Input
            className="mt-1.5 h-9 text-sm"
            placeholder="https://yourcompany.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </div>

      <SectorPicker value={sector} onSelect={bindField('sector')} />
    </div>
  )
}
