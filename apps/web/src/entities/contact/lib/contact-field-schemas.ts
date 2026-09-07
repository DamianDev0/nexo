import { isValidCOPhone, phoneDigits } from '@repo/shared-utils'
import { z } from 'zod'

import type { TFunction } from 'i18next'

export function optionalPhoneSchema(t: TFunction) {
  return z
    .string()
    .trim()
    .transform(phoneDigits)
    .refine((value) => value === '' || isValidCOPhone(value), t('contacts.errors.phoneInvalid'))
}

export function optionalEmailSchema(t: TFunction) {
  return z.string().trim().email(t('contacts.errors.emailInvalid')).or(z.literal(''))
}

export function contactCoreFieldsSchema(t: TFunction) {
  return z.object({
    firstName: z.string().trim().min(1, t('contacts.errors.firstNameRequired')),
    lastName: z.string().trim(),
    email: optionalEmailSchema(t),
    phone: optionalPhoneSchema(t),
    whatsapp: optionalPhoneSchema(t),
    address: z.string().trim(),
    city: z.string().trim(),
    municipioCode: z.string().trim(),
    source: z.string(),
  })
}
