import { z } from 'zod'

import { contactCoreFieldsSchema } from '@/entities/contact'

import type { TFunction } from 'i18next'

export function buildContactSchema(t: TFunction) {
  return contactCoreFieldsSchema(t).extend({
    whatsappSameAsPhone: z.boolean(),
    avatarUrl: z.string().trim(),
    status: z.string().min(1),
    lifecycleStage: z.string(),
  })
}

export type ContactFormValues = z.infer<ReturnType<typeof buildContactSchema>>

export function resolveWhatsapp(values: ContactFormValues): string {
  return values.whatsappSameAsPhone ? values.phone : values.whatsapp
}
