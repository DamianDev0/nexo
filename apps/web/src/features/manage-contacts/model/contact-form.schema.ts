import { ContactStatus } from '@repo/shared-types'
import { z } from 'zod'

import type { TFunction } from 'i18next'

export function buildContactSchema(t: TFunction) {
  return z.object({
    firstName: z.string().trim().min(1, t('contacts.errors.firstNameRequired')),
    lastName: z.string().trim(),
    email: z
      .string()
      .trim()
      .email(t('contacts.errors.emailInvalid'))
      .or(z.literal(''))
      .transform((value) => value || ''),
    phone: z.string().trim(),
    whatsapp: z.string().trim(),
    city: z.string().trim(),
    status: z.nativeEnum(ContactStatus),
  })
}

export type ContactFormValues = z.infer<ReturnType<typeof buildContactSchema>>

export const CONTACT_FORM_DEFAULTS: ContactFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  whatsapp: '',
  city: '',
  status: ContactStatus.NEW,
}
