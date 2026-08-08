'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AddressField, MunicipalityCombobox } from '@/entities/geo'
import { ControlledField } from '@/shared/ui/molecules/controlled-field'
import { Label } from '@/shared/ui/shadcn/label'

import { ContactPhoneFields } from './ContactPhoneFields'
import { TaxonomySelectField } from './TaxonomySelectField'

import type { ContactFormValues } from '../model/contact-form.schema'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { Control, UseFormSetValue } from 'react-hook-form'

interface ContactFormFieldsProps {
  readonly control: Control<ContactFormValues>
  readonly setValue: UseFormSetValue<ContactFormValues>
  readonly taxonomy: {
    readonly statuses: ReadonlyArray<TaxonomyChoice>
    readonly sources: ReadonlyArray<TaxonomyChoice>
  }
}

export function ContactFormFields({
  control,
  setValue,
  taxonomy,
}: Readonly<ContactFormFieldsProps>) {
  const { t } = useTranslation()
  const { statuses, sources } = taxonomy

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3.5">
        <ControlledField
          control={control}
          name="firstName"
          label={t('contacts.form.firstName')}
          placeholder={t('contacts.form.firstNamePlaceholder')}
          required
        />
        <ControlledField
          control={control}
          name="lastName"
          label={t('contacts.form.lastName')}
          placeholder={t('contacts.form.lastNamePlaceholder')}
        />
      </div>
      <ControlledField
        control={control}
        name="email"
        type="email"
        label={t('contacts.form.email')}
        placeholder={t('contacts.form.emailPlaceholder')}
      />
      <ContactPhoneFields control={control} />
      <Controller
        control={control}
        name="address"
        render={({ field }) => (
          <div>
            <Label className="text-xs text-muted-foreground">{t('contacts.form.address')}</Label>
            <div className="mt-1.5">
              <AddressField
                value={field.value}
                onChange={field.onChange}
                placeholder={t('contacts.form.addressPlaceholder')}
              />
            </div>
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-3.5">
        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <div>
              <Label className="text-xs text-muted-foreground">{t('contacts.form.city')}</Label>
              <div className="mt-1.5">
                <MunicipalityCombobox
                  value={field.value}
                  placeholder={t('contacts.form.cityPlaceholder')}
                  onSelect={(municipality) => {
                    field.onChange(municipality.name)
                    setValue('municipioCode', municipality.code, { shouldDirty: true })
                  }}
                />
              </div>
            </div>
          )}
        />
        <TaxonomySelectField
          control={control}
          name="status"
          label={t('contacts.form.status')}
          choices={statuses}
        />
      </div>
      <TaxonomySelectField
        control={control}
        name="source"
        label={t('contacts.form.source')}
        placeholder={t('contacts.form.sourcePlaceholder')}
        choices={sources}
      />
    </div>
  )
}
