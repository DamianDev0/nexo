import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { useEntityTerms } from '@/entities/nomenclature'
import contactsService from '@/shared/api/services/contacts.service'

import { CONTACT_FORM_DEFAULTS } from '../config/contact-form.constants'
import { duplicateFormField, duplicateMessage } from '../lib/contact-duplicates'
import { stripNullValues, toFormValues, toInput } from '../lib/contact-form-mapping'
import { buildContactSchema, type ContactFormValues } from '../lib/contact-form.schema'
import { validateCustomValues } from '../lib/custom-field-validation'
import { useContactCustomFields } from '../query/useContactCustomFields'
import { useProbeContactDuplicate } from '../query/useProbeContactDuplicate'
import { useSaveContact } from '../query/useSaveContact'

import type {
  ContactDuplicatePayload,
  ContactDuplicateProbeQuery,
  ContactListItem,
} from '@repo/shared-types'

type ProbeFieldName = 'email' | 'phone'

export function useContactForm(contact: ContactListItem | null, onDone: () => void) {
  const { t } = useTranslation()
  const { statuses, sources, lifecycleStages } = useContactTaxonomy()
  const terms = useEntityTerms('contact')
  const customFieldDefs = useContactCustomFields()
  const probeDuplicate = useProbeContactDuplicate()
  const [customValues, setCustomValues] = useState<Record<string, unknown>>(
    () => contact?.customFields ?? {},
  )
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({})
  const schema = useMemo(() => buildContactSchema(t), [t])

  const defaultStatus = statuses[0]?.key ?? ''
  const defaultStage = lifecycleStages[0]?.key ?? ''
  const formValues = useMemo<ContactFormValues>(
    () =>
      contact
        ? toFormValues(contact)
        : { ...CONTACT_FORM_DEFAULTS, status: defaultStatus, lifecycleStage: defaultStage },
    [contact, defaultStage, defaultStatus],
  )

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: CONTACT_FORM_DEFAULTS,
    values: formValues,
    resetOptions: { keepDirtyValues: true },
    mode: 'onBlur',
  })

  const [pendingDuplicate, setPendingDuplicate] = useState<ContactDuplicatePayload | null>(null)

  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      setPendingDuplicate(null)
      if (name && form.getFieldState(name).error?.type === 'duplicate') form.clearErrors(name)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const markDuplicate = (duplicate: ContactDuplicatePayload) => {
    const field = duplicateFormField(duplicate.field)
    if (field) {
      form.setError(field, {
        type: 'duplicate',
        message: duplicateMessage(t, duplicate, terms.lowerSingular),
      })
    }
    if (duplicate.canForce || !field) setPendingDuplicate(duplicate)
  }

  const saver = useSaveContact<ContactFormValues>({
    mutationFn: ({ values, force }) =>
      contact
        ? contactsService.update(contact.id, toInput(values, customValues), force)
        : contactsService.create(toInput(values, stripNullValues(customValues)), force),
    successTitle: () =>
      t(contact ? 'contacts.toasts.updated' : 'contacts.toasts.created', {
        entity: terms.singular,
      }),
    onDuplicate: markDuplicate,
    onSubmitStart: () => setPendingDuplicate(null),
    onSaved: (addAnother) => {
      if (addAnother) {
        form.reset(CONTACT_FORM_DEFAULTS)
        setCustomValues({})
        return
      }
      onDone()
    },
  })

  const probeField = async (field: ProbeFieldName): Promise<void> => {
    const value = form.getValues(field).trim()
    if (!value) return
    if (contact && value === (contact[field] ?? '')) return

    const params: ContactDuplicateProbeQuery =
      field === 'email' ? { email: value } : { phone: value }
    if (contact) params.excludeId = contact.id

    const duplicate = await probeDuplicate(params)
    if (form.getValues(field).trim() !== value) return

    if (duplicate && duplicateFormField(duplicate.field) === field) {
      form.setError(field, {
        type: 'duplicate',
        message: duplicateMessage(t, duplicate, terms.lowerSingular),
      })
    }
  }

  const setCustomValue = (key: string, value: unknown) => {
    setCustomErrors(({ [key]: _cleared, ...rest }) => rest)
    setCustomValues((current) => {
      if (value === undefined || value === null || value === '') {
        return { ...current, [key]: null }
      }
      return { ...current, [key]: value }
    })
  }

  const submitChecked = (addAnother: boolean) =>
    form.handleSubmit((values) => {
      const errors = validateCustomValues(customFieldDefs, customValues, t)
      if (Object.keys(errors).length > 0) {
        setCustomErrors(errors)
        return
      }
      saver.save({ values, addAnother })
    })

  return {
    form,
    taxonomy: { statuses, sources, lifecycleStages },
    customFields: {
      defs: customFieldDefs,
      values: customValues,
      errors: customErrors,
      setValue: setCustomValue,
    },
    isEdit: Boolean(contact),
    isPending: saver.isPending,
    probeField,
    handleSubmit: submitChecked(false),
    submitAndAddAnother: () => {
      void submitChecked(true)()
    },
    duplicateNotice: pendingDuplicate
      ? {
          message: duplicateMessage(t, pendingDuplicate, terms.lowerSingular),
          canForce: pendingDuplicate.canForce,
        }
      : null,
    confirmDuplicate: saver.retryWithForce,
    dismissDuplicate: () => setPendingDuplicate(null),
  }
}
