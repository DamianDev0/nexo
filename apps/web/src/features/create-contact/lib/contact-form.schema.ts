import { isValidCOPhone, phoneDigits } from '@repo/shared-utils'
import { z } from 'zod'

import { CONTACT_TYPE_OTHER_KEY } from '../config/contact-type.constants'

import type { TFunction } from 'i18next'

function optionalPhone(t: TFunction) {
  return z
    .string()
    .trim()
    .transform(phoneDigits)
    .refine((value) => value === '' || isValidCOPhone(value), t('contacts.errors.phoneInvalid'))
}

export function buildContactSchema(t: TFunction) {
  return z
    .object({
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
      avatarUrl: z.string().trim(),
      status: z.string().min(1),
      source: z.string(),
      type: z.string(),
      typeLabel: z.string().trim(),
    })
    .superRefine((values, ctx) => {
      if (values.type === CONTACT_TYPE_OTHER_KEY && values.typeLabel === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['typeLabel'],
          message: t('contacts.errors.typeOtherRequired'),
        })
      }
    })
}

export type ContactFormValues = z.infer<ReturnType<typeof buildContactSchema>>

export function resolveWhatsapp(values: ContactFormValues): string {
  return values.whatsappSameAsPhone ? values.phone : values.whatsapp
}
