'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MunicipalityCombobox } from '@/entities/geo'
import { FieldLabel } from '@/shared/ui/atoms/field-label'

import type { Control, FieldValues, Path } from 'react-hook-form'

export type MunicipalityPick = { readonly code: string; readonly name: string }

type ContactCityFieldProps<T extends FieldValues> = {
  readonly control: Control<T>
  readonly name: Extract<Path<T>, 'city'>
  readonly onSelect: (municipality: MunicipalityPick) => void
  readonly compact?: boolean
}

export function ContactCityField<T extends FieldValues>({
  control,
  name,
  onSelect,
  compact,
}: Readonly<ContactCityFieldProps<T>>) {
  const { t } = useTranslation()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <FieldLabel>{t('contacts.form.city')}</FieldLabel>
          <div className={compact ? 'mt-1' : 'mt-1.5'}>
            <MunicipalityCombobox
              value={String(field.value ?? '')}
              placeholder={t('contacts.form.cityPlaceholder')}
              onSelect={(municipality) => {
                field.onChange(municipality.name)
                onSelect(municipality)
              }}
            />
          </div>
        </div>
      )}
    />
  )
}
