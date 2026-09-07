'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { t } from 'i18next'
import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { missingContactFields, useAddressAutofill } from '@/entities/contact'

import {
  buildAddressCustomFields,
  buildContactDetailsSchema,
  buildDetailsPatch,
  contactDetailsDefaults,
} from '../lib/contact-details-form.schema'

import type { ContactDetailsField, ContactDetailsValues } from '../lib/contact-details-form.schema'
import type { ContactFieldsPatch, ContactRequiredField, MunicipalityPick } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

export type ContactDetailsSavers = {
  readonly fields?: (contactId: string, patch: ContactFieldsPatch) => void
  readonly customFields?: (contactId: string, customFields: Record<string, unknown>) => void
}

export function useContactDetailsForm(contact: ContactListItem, savers: ContactDetailsSavers = {}) {
  const schema = useMemo(() => buildContactDetailsSchema(t), [])
  const form = useForm<ContactDetailsValues>({
    resolver: zodResolver(schema),
    defaultValues: contactDetailsDefaults(contact),
    mode: 'onBlur',
  })
  const missing = useMemo<ReadonlySet<ContactRequiredField>>(
    () => new Set(missingContactFields(contact)),
    [contact],
  )
  const { fields: saveFields, customFields: saveCustomFields } = savers

  const commit = useCallback(
    async (field: ContactDetailsField) => {
      const valid = await form.trigger(field)
      if (!valid) return
      const parsed = schema.shape[field].safeParse(form.getValues(field))
      if (!parsed.success) return
      const values = { ...form.getValues(), [field]: parsed.data }
      if (field === 'address') {
        const customFields = buildAddressCustomFields(contact, values.address)
        if (customFields) saveCustomFields?.(contact.id, customFields)
        return
      }
      const patch = buildDetailsPatch(field, values, contact)
      if (patch) saveFields?.(contact.id, patch)
    },
    [form, schema, contact, saveFields, saveCustomFields],
  )

  const selectCity = useCallback(
    (municipality: MunicipalityPick) => {
      form.setValue('city', municipality.name, { shouldDirty: true })
      form.setValue('municipioCode', municipality.code, { shouldDirty: true })
      void commit('city')
    },
    [form, commit],
  )

  const autofillCity = useAddressAutofill(selectCity)

  return {
    form,
    commit,
    selectCity,
    autofillCity,
    missing,
    readOnly: !saveFields && !saveCustomFields,
  }
}
