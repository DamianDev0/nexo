import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { useEntityTerms } from '@/entities/nomenclature'
import contactsService from '@/shared/api/services/contacts.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { CONTACT_FORM_DEFAULTS } from '../config/contact-form.constants'
import { duplicateFormField, duplicateMessage } from '../lib/contact-duplicates'
import { stripNullValues, toFormValues, toInput } from '../lib/contact-form-mapping'
import { buildContactSchema, type ContactFormValues } from '../lib/contact-form.schema'
import { validateCustomValues } from '../lib/custom-field-validation'
import { useContactCustomFields } from '../query/useContactCustomFields'

import type { ApiHandledError } from '@/shared/api/error-handler'
import type {
  Contact,
  ContactDuplicatePayload,
  ContactDuplicateProbeQuery,
  ContactListItem,
} from '@repo/shared-types'

type SubmitVariables = { values: ContactFormValues; addAnother: boolean; force?: boolean }

type ProbeFieldName = 'email' | 'phone'

export function useContactForm(contact: ContactListItem | null, onDone: () => void) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { statuses, sources, types, lifecycleStages } = useContactTaxonomy()
  const terms = useEntityTerms('contact')
  const customFieldDefs = useContactCustomFields()
  const [customValues, setCustomValues] = useState<Record<string, unknown>>(
    () => contact?.customFields ?? {},
  )
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({})
  const schema = useMemo(() => buildContactSchema(t, terms.lowerSingular), [t, terms.lowerSingular])

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

  const probeField = async (field: ProbeFieldName): Promise<void> => {
    const value = form.getValues(field).trim()
    if (!value) return
    if (contact && value === (contact[field] ?? '')) return

    const params: ContactDuplicateProbeQuery =
      field === 'email' ? { email: value } : { phone: value }
    if (contact) params.excludeId = contact.id

    let duplicate: ContactDuplicatePayload | null
    try {
      ;({ duplicate } = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.contacts.duplicateProbe(params),
        queryFn: () => contactsService.probeDuplicates(params),
        staleTime: 30_000,
        retry: false,
      }))
    } catch {
      return
    }

    if (form.getValues(field).trim() !== value) return

    if (duplicate && duplicateFormField(duplicate.field) === field) {
      form.setError(field, {
        type: 'duplicate',
        message: duplicateMessage(t, duplicate, terms.lowerSingular),
      })
    }
  }

  const mutation = useMutation<Contact, ApiHandledError, SubmitVariables>({
    mutationFn: ({ values, force }) =>
      contact
        ? contactsService.update(contact.id, toInput(values, customValues), force)
        : contactsService.create(toInput(values, stripNullValues(customValues)), force),
    onMutate: () => setPendingDuplicate(null),
    onSuccess: (_, { addAnother }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      sileo.success({
        title: t(contact ? 'contacts.toasts.updated' : 'contacts.toasts.created', {
          entity: terms.singular,
        }),
      })
      if (addAnother) {
        form.reset(CONTACT_FORM_DEFAULTS)
        setCustomValues({})
        return
      }
      onDone()
    },
    onError: (error) => {
      if (error.statusCode === 409 && error.message === 'contact_duplicate' && error.duplicate) {
        const field = duplicateFormField(error.duplicate.field)
        if (field) {
          form.setError(field, {
            type: 'duplicate',
            message: duplicateMessage(t, error.duplicate, terms.lowerSingular),
          })
        }
        if (error.duplicate.canForce || !field) {
          setPendingDuplicate(error.duplicate)
        }
        return
      }
      notifySaveFailed(error)
    },
  })

  const confirmDuplicate = () => {
    const variables = mutation.variables
    if (!variables) return
    mutation.mutate({ ...variables, force: true })
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
      mutation.mutate({ values, addAnother })
    })

  return {
    form,
    taxonomy: { statuses, sources, types, lifecycleStages },
    customFields: {
      defs: customFieldDefs,
      values: customValues,
      errors: customErrors,
      setValue: setCustomValue,
    },
    isEdit: Boolean(contact),
    isPending: mutation.isPending,
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
    confirmDuplicate,
    dismissDuplicate: () => setPendingDuplicate(null),
  }
}
