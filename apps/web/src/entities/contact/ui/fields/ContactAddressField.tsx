'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AddressField } from '@/entities/geo'
import { FieldLabel } from '@/shared/ui/atoms/field-label'

import type { AddressPlace } from '@/entities/geo'
import type { Control, FieldValues, Path } from 'react-hook-form'

type ContactAddressFieldProps<T extends FieldValues> = {
  readonly control: Control<T>
  readonly name: Extract<Path<T>, 'address'>
  readonly onPlaceSelect?: (place: AddressPlace) => void
  readonly onBlur?: () => void
  readonly compact?: boolean
}

export function ContactAddressField<T extends FieldValues>({
  control,
  name,
  onPlaceSelect,
  onBlur,
  compact,
}: Readonly<ContactAddressFieldProps<T>>) {
  const { t } = useTranslation()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div onBlur={onBlur}>
          <FieldLabel>{t('contacts.form.address')}</FieldLabel>
          <div className={compact ? 'mt-1' : 'mt-1.5'}>
            <AddressField
              value={String(field.value ?? '')}
              onChange={field.onChange}
              onPlaceSelect={onPlaceSelect}
              placeholder={t('contacts.form.addressPlaceholder')}
            />
          </div>
        </div>
      )}
    />
  )
}
