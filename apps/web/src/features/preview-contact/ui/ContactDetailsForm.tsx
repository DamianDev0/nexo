'use client'

import { useTranslation } from 'react-i18next'

import {
  ContactAddressField,
  ContactCityField,
  ContactPhoneField,
  TaxonomySelectField,
} from '@/entities/contact'

import { CONTACT_DETAILS_FIELDS } from '../config/contact-details-fields'
import { useContactDetailsForm } from '../model/useContactDetailsForm'

import { ContactDetailsInput } from './ContactDetailsInput'

import type { ContactDetailsSavers } from '../model/useContactDetailsForm'
import type { ContactRequiredField } from '@/entities/contact'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactListItem } from '@repo/shared-types'
import type { TFunction } from 'i18next'

const PHONE_FIELDS = ['phone', 'whatsapp'] as const
const IDENTITY_FIELDS = CONTACT_DETAILS_FIELDS.filter((spec) => spec.name !== 'documentNumber')
const DOCUMENT_FIELDS = CONTACT_DETAILS_FIELDS.filter((spec) => spec.name === 'documentNumber')

function isRequired(name: string): name is ContactRequiredField {
  return name === 'email' || name === 'phone' || name === 'documentNumber'
}

function missingLabel(t: TFunction, labelKey: string): string {
  return t('contacts.completeness.field', { field: t(labelKey).toLocaleLowerCase() })
}

type ContactDetailsFormProps = {
  readonly contact: ContactListItem
  readonly sources: ReadonlyArray<TaxonomyChoice>
  readonly savers: ContactDetailsSavers
}

export function ContactDetailsForm({
  contact,
  sources,
  savers,
}: Readonly<ContactDetailsFormProps>) {
  const { t } = useTranslation()
  const { form, commit, selectCity, autofillCity, missing, readOnly } = useContactDetailsForm(
    contact,
    savers,
  )

  const renderInput = (spec: (typeof CONTACT_DETAILS_FIELDS)[number]) => (
    <ContactDetailsInput
      key={spec.name}
      control={form.control}
      spec={spec}
      state={{
        id: contact.id,
        readOnly,
        missingHint:
          isRequired(spec.name) && missing.has(spec.name)
            ? missingLabel(t, spec.labelKey)
            : undefined,
      }}
      onCommit={() => void commit(spec.name)}
    />
  )

  return (
    <div className="flex flex-col gap-2.5">
      {IDENTITY_FIELDS.map(renderInput)}
      <div className="grid grid-cols-2 gap-2.5">
        {PHONE_FIELDS.map((name) => (
          <ContactPhoneField
            key={name}
            control={form.control}
            name={name}
            label={t(`contacts.form.${name}`)}
            onBlur={() => void commit(name)}
            view={{
              compact: true,
              disabled: readOnly,
              hint:
                name === 'phone' && missing.has('phone')
                  ? missingLabel(t, 'contacts.form.phone')
                  : undefined,
            }}
          />
        ))}
      </div>
      <ContactAddressField
        control={form.control}
        name="address"
        compact
        onBlur={() => void commit('address')}
        onPlaceSelect={(place) => autofillCity(place.secondaryText)}
      />
      <ContactCityField control={form.control} name="city" compact onSelect={selectCity} />
      {DOCUMENT_FIELDS.map(renderInput)}
      <TaxonomySelectField
        control={form.control}
        name="source"
        label={t('contacts.form.source')}
        choices={sources}
        view={{
          compact: true,
          disabled: readOnly,
          placeholder: t('contacts.preview.details.sourcePlaceholder'),
          onChange: () => void commit('source'),
        }}
      />
    </div>
  )
}
