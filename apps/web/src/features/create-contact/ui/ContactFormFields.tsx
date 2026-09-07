'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  CONTACT_AVATARS,
  ContactAddressField,
  ContactCityField,
  TaxonomySelectField,
  useAddressAutofill,
} from '@/entities/contact'
import { useEntityTerms } from '@/entities/nomenclature'
import { AvatarPicker } from '@/shared/ui/kokonutui/avatar-picker'
import { ControlledField } from '@/shared/ui/molecules/controlled-field'

import { ContactPhoneFields } from './ContactPhoneFields'

import type { ContactFormValues } from '../lib/contact-form.schema'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { Control, UseFormSetValue } from 'react-hook-form'

type ContactFormFieldsProps = {
  readonly control: Control<ContactFormValues>
  readonly setValue: UseFormSetValue<ContactFormValues>
  readonly taxonomy: {
    readonly statuses: ReadonlyArray<TaxonomyChoice>
    readonly sources: ReadonlyArray<TaxonomyChoice>
    readonly lifecycleStages: ReadonlyArray<TaxonomyChoice>
  }
  readonly onProbeField?: (field: 'email' | 'phone') => void
}

export function ContactFormFields({
  control,
  setValue,
  taxonomy,
  onProbeField,
}: Readonly<ContactFormFieldsProps>) {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const { statuses, sources, lifecycleStages } = taxonomy
  const handlePlaceSelect = useAddressAutofill((municipality) => {
    setValue('city', municipality.name, { shouldDirty: true })
    setValue('municipioCode', municipality.code, { shouldDirty: true })
  })

  return (
    <div className="flex flex-col gap-3.5">
      <Controller
        control={control}
        name="avatarUrl"
        render={({ field }) => (
          <AvatarPicker
            avatars={CONTACT_AVATARS}
            value={field.value || null}
            labels={{ trigger: t('contacts.form.avatar'), title: t('contacts.form.avatarPick') }}
            onChange={field.onChange}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-3.5">
        <ControlledField
          control={control}
          name="firstName"
          field={{
            label: t('contacts.form.firstName'),
            placeholder: t('contacts.form.firstNamePlaceholder'),
            required: true,
          }}
        />
        <ControlledField
          control={control}
          name="lastName"
          field={{
            label: t('contacts.form.lastName'),
            placeholder: t('contacts.form.lastNamePlaceholder'),
          }}
        />
      </div>
      <ControlledField
        control={control}
        name="email"
        field={{
          label: t('contacts.form.email'),
          type: 'email',
          placeholder: t('contacts.form.emailPlaceholder'),
        }}
        actions={{ onBlur: () => onProbeField?.('email') }}
      />
      <ContactPhoneFields control={control} onPhoneBlur={() => onProbeField?.('phone')} />
      <ContactAddressField
        control={control}
        name="address"
        onPlaceSelect={(place) => handlePlaceSelect(place.secondaryText)}
      />

      <div className="grid grid-cols-2 gap-3.5">
        <ContactCityField
          control={control}
          name="city"
          onSelect={(municipality) =>
            setValue('municipioCode', municipality.code, { shouldDirty: true })
          }
        />
        <TaxonomySelectField
          control={control}
          name="status"
          label={t('contacts.form.status')}
          choices={statuses}
        />
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <TaxonomySelectField
          control={control}
          name="source"
          label={t('contacts.form.source')}
          choices={sources}
          view={{
            placeholder: t('contacts.form.sourcePlaceholder', { entity: terms.lowerSingular }),
          }}
        />
        <TaxonomySelectField
          control={control}
          name="lifecycleStage"
          label={t('contacts.form.lifecycleStage')}
          choices={lifecycleStages}
        />
      </div>
    </div>
  )
}
