import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { CONTACT_FORM_DEFAULTS } from '../config/contact-form.constants'
import { CONTACT_TYPE_OTHER_KEY } from '../config/contact-type.constants'
import { duplicateFormField, duplicateMessage } from '../lib/contact-duplicates'
import {
  resolveWhatsapp,
  buildContactSchema,
  type ContactFormValues,
} from '../lib/contact-form.schema'

import type { ApiHandledError } from '@/shared/api/error-handler'
import type {
  Contact,
  ContactDuplicatePayload,
  ContactDuplicateProbeQuery,
  ContactInput,
  ContactListItem,
} from '@repo/shared-types'

type SubmitVariables = { values: ContactFormValues; addAnother: boolean; force?: boolean }

type ProbeFieldName = 'email' | 'phone'

function toInput(values: ContactFormValues): ContactInput {
  return {
    firstName: values.firstName,
    lastName: values.lastName || undefined,
    email: values.email || undefined,
    phone: values.phone || undefined,
    whatsapp: resolveWhatsapp(values) || undefined,
    address: values.address || undefined,
    city: values.city || undefined,
    municipioCode: values.municipioCode || undefined,
    status: values.status,
    source: values.source || undefined,
    type: values.type || undefined,
    typeLabel:
      values.type === CONTACT_TYPE_OTHER_KEY && values.typeLabel ? values.typeLabel : undefined,
  }
}

function toFormValues(contact: ContactListItem): ContactFormValues {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName ?? '',
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    whatsapp: contact.whatsapp ?? '',
    whatsappSameAsPhone: Boolean(contact.phone) && contact.phone === contact.whatsapp,
    address: contact.address ?? '',
    city: contact.city ?? '',
    municipioCode: contact.municipioCode ?? '',
    status: contact.status,
    source: contact.source ?? '',
    type: contact.type ?? '',
    typeLabel: contact.typeLabel ?? '',
  }
}

export function useContactForm(contact: ContactListItem | null, onDone: () => void) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { statuses, sources, types } = useContactTaxonomy()
  const schema = useMemo(() => buildContactSchema(t), [t])

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: CONTACT_FORM_DEFAULTS,
    mode: 'onBlur',
  })

  const [pendingDuplicate, setPendingDuplicate] = useState<ContactDuplicatePayload | null>(null)

  useEffect(() => {
    form.reset(contact ? toFormValues(contact) : CONTACT_FORM_DEFAULTS)
  }, [contact, form])

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
        ? contactsService.update(contact.id, toInput(values), force)
        : contactsService.create(toInput(values), force),
    onMutate: () => setPendingDuplicate(null),
    onSuccess: (_, { addAnother }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      sileo.success({ title: t(contact ? 'contacts.toasts.updated' : 'contacts.toasts.created') })
      if (addAnother) {
        form.reset(CONTACT_FORM_DEFAULTS)
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

  return {
    form,
    taxonomy: { statuses, sources, types },
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
