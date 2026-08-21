import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import { useEntityTerms } from '@/entities/nomenclature'
import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { CONTACT_FORM_DEFAULTS } from '../config/contact-form.constants'
import { duplicateFormField, duplicateMessage } from '../lib/contact-duplicates'
import { toFormValues, toInput } from '../lib/contact-form-mapping'
import { buildContactSchema, type ContactFormValues } from '../lib/contact-form.schema'
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
  const { statuses, sources, types } = useContactTaxonomy()
  const terms = useEntityTerms('contact')
  const customFieldDefs = useContactCustomFields()
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({})
  const schema = useMemo(() => buildContactSchema(t), [t])

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: CONTACT_FORM_DEFAULTS,
    mode: 'onBlur',
  })

  const [pendingDuplicate, setPendingDuplicate] = useState<ContactDuplicatePayload | null>(null)

  useEffect(() => {
    form.reset(contact ? toFormValues(contact) : CONTACT_FORM_DEFAULTS)
    setCustomValues(contact?.customFields ?? {})
  }, [contact, form])

  const defaultStatus = statuses[0]?.key ?? ''
  useEffect(() => {
    if (!contact && defaultStatus && !form.getValues('status')) {
      form.setValue('status', defaultStatus)
    }
  }, [contact, defaultStatus, form])

  useEffect(() => {
    if (!pendingDuplicate) return
    const subscription = form.watch(() => setPendingDuplicate(null))
    return () => subscription.unsubscribe()
  }, [pendingDuplicate, form])

  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
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
      form.setError(field, { type: 'duplicate', message: duplicateMessage(t, duplicate) })
    }
  }

  const mutation = useMutation<Contact, ApiHandledError, SubmitVariables>({
    mutationFn: ({ values, force }) =>
      contact
        ? contactsService.update(contact.id, toInput(values, customValues), force)
        : contactsService.create(toInput(values, customValues), force),
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
            message: duplicateMessage(t, error.duplicate),
          })
        }
        if (error.duplicate.canForce || !field) {
          setPendingDuplicate(error.duplicate)
        }
        return
      }
      sileo.error({ title: t('common.saveFailed'), description: error.message })
    },
  })

  const confirmDuplicate = () => {
    const variables = mutation.variables
    if (!variables) return
    mutation.mutate({ ...variables, force: true })
  }

  const setCustomValue = (key: string, value: unknown) => {
    setCustomValues((current) => {
      if (value === undefined || value === null || value === '') {
        const { [key]: _removed, ...rest } = current
        return rest
      }
      return { ...current, [key]: value }
    })
  }

  return {
    form,
    taxonomy: { statuses, sources, types },
    customFields: { defs: customFieldDefs, values: customValues, setValue: setCustomValue },
    isEdit: Boolean(contact),
    isPending: mutation.isPending,
    probeField,
    handleSubmit: form.handleSubmit((values) => mutation.mutate({ values, addAnother: false })),
    submitAndAddAnother: () => {
      void form.handleSubmit((values) => mutation.mutate({ values, addAnother: true }))()
    },
    duplicateNotice: pendingDuplicate
      ? {
          message: duplicateMessage(t, pendingDuplicate),
          canForce: pendingDuplicate.canForce,
        }
      : null,
    confirmDuplicate,
    dismissDuplicate: () => setPendingDuplicate(null),
  }
}
