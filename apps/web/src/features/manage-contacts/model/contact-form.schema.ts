import { DEFAULT_CONTACT_STATUS_KEY } from '@repo/shared-types'
import { isValidCOPhone, phoneDigits } from '@repo/shared-utils'
import { z } from 'zod'

import type { TFunction } from 'i18next'

function optionalPhone(t: TFunction) {
  return z
    .string()
    .trim()
    .transform(phoneDigits)
    .refine((value) => value === '' || isValidCOPhone(value), t('contacts.errors.phoneInvalid'))
}

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
    phone: optionalPhone(t),
    whatsapp: optionalPhone(t),
    whatsappSameAsPhone: z.boolean(),
    address: z.string().trim(),
    city: z.string().trim(),
    municipioCode: z.string().trim(),
    status: z.string().min(1),
    source: z.string(),
  })
}

export type ContactFormValues = z.infer<ReturnType<typeof buildContactSchema>>

export function resolveWhatsapp(values: ContactFormValues): string {
  return values.whatsappSameAsPhone ? values.phone : values.whatsapp
}

export const CONTACT_FORM_DEFAULTS: ContactFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  whatsapp: '',
  whatsappSameAsPhone: false,
  address: '',
  city: '',
  municipioCode: '',
  status: DEFAULT_CONTACT_STATUS_KEY,
  source: '',
}
