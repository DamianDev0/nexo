'use client'

import { useTranslation } from 'react-i18next'

import { OptionTile } from '@/shared/ui/molecules/option-tile'

import { CREATABLE_FIELD_TYPES, FIELD_TYPE_ICONS } from '../../../config/custom-fields.constants'

import type { CustomFieldType } from '@repo/shared-types'

interface FieldTypePickerProps {
  readonly value: CustomFieldType
  readonly onChange: (type: CustomFieldType) => void
}

export function FieldTypePicker({ value, onChange }: Readonly<FieldTypePickerProps>) {
  const { t } = useTranslation()

  return (
    <div
      className="grid grid-cols-3 gap-1.5"
      role="radiogroup"
      aria-label={t('settings.fields.typeLabel')}
    >
      {CREATABLE_FIELD_TYPES.map((fieldType) => {
        const Icon = FIELD_TYPE_ICONS[fieldType]
        return (
          <OptionTile
            key={fieldType}
            selected={value === fieldType}
            onSelect={() => onChange(fieldType)}
            className="flex flex-col items-center gap-1 px-1 py-2.5"
          >
            {Icon && <Icon className="size-4" />}
            <span className="text-xs leading-tight">{t(`settings.fields.types.${fieldType}`)}</span>
          </OptionTile>
        )
      })}
    </div>
  )
}
