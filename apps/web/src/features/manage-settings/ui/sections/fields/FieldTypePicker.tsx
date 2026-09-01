'use client'

import { useTranslation } from 'react-i18next'

import { TileRadioGroup } from '@/shared/ui/molecules/tile-radio-group'

import { CREATABLE_FIELD_TYPES, FIELD_TYPE_ICONS } from '../../../config/custom-fields.constants'

import type { CustomFieldType } from '@repo/shared-types'

interface FieldTypePickerProps {
  readonly value: CustomFieldType
  readonly onChange: (type: CustomFieldType) => void
}

export function FieldTypePicker({ value, onChange }: Readonly<FieldTypePickerProps>) {
  const { t } = useTranslation()

  const options = CREATABLE_FIELD_TYPES.map((fieldType) => {
    const Icon = FIELD_TYPE_ICONS[fieldType]
    return {
      value: fieldType,
      content: (
        <>
          {Icon && <Icon className="size-4" />}
          <span className="text-xs leading-tight">{t(`settings.fields.types.${fieldType}`)}</span>
        </>
      ),
    }
  })

  return (
    <TileRadioGroup
      value={value}
      onChange={onChange}
      options={options}
      label={t('settings.fields.typeLabel')}
      classes={{
        group: 'grid-cols-3 gap-1.5',
        tile: 'flex flex-col items-center gap-1 px-1 py-2.5',
      }}
    />
  )
}
