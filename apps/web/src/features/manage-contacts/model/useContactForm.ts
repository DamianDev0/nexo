import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import { useContactTaxonomy } from '@/entities/contact-taxonomy'
import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import {
  CONTACT_FORM_DEFAULTS,
  resolveWhatsapp,
  buildContactSchema,
  type ContactFormValues,
} from './contact-form.schema'

import type { ContactInput, ContactListItem } from '@repo/shared-types'

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
  }
}

export function useContactForm(contact: ContactListItem | null, onDone: () => void) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { statuses, sources } = useContactTaxonomy()
  const schema = useMemo(() => buildContactSchema(t), [t])

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: CONTACT_FORM_DEFAULTS,
    mode: 'onBlur',
  })

  useEffect(() => {
    form.reset(contact ? toFormValues(contact) : CONTACT_FORM_DEFAULTS)
  }, [contact, form])

  const mutation = useMutation({
    mutationFn: (values: ContactFormValues) =>
      contact
        ? contactsService.update(contact.id, toInput(values))
        : contactsService.create(toInput(values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      sileo.success({ title: t(contact ? 'contacts.toasts.updated' : 'contacts.toasts.created') })
      onDone()
    },
    onError: (error: { message?: string }) => {
      sileo.error({ title: t('common.saveFailed'), description: error.message })
    },
  })

  return {
    form,
    taxonomy: { statuses, sources },
    isEdit: Boolean(contact),
    isPending: mutation.isPending,
    handleSubmit: form.handleSubmit((values) => mutation.mutate(values)),
  }
}
