'use client'

import { useWatch } from 'react-hook-form'

import { NomenclatureFields } from '@/features/setup-workspace'

import { useManageSettings } from '../../model/settings-context'

export function NomenclatureSettings() {
  const { nomenclature } = useManageSettings()
  const [contact, company, deal, activity] = useWatch({
    control: nomenclature.control,
    name: ['contact', 'company', 'deal', 'activity'],
  })

  return (
    <div className="max-w-3xl">
      <NomenclatureFields
        data={{ contact, company, deal, activity }}
        onUpdate={nomenclature.handleUpdate}
        onPreset={nomenclature.handlePreset}
      />
    </div>
  )
}
