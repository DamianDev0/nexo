import { z } from 'zod'

type TranslateFn = (key: string) => string

export function buildViewFormSchema(t: TranslateFn) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('contacts.views.nameRequired'))
      .max(120, t('contacts.views.nameTooLong')),
    description: z.string().trim().max(300, t('contacts.views.descriptionTooLong')),
  })
}

export type ViewFormValues = z.infer<ReturnType<typeof buildViewFormSchema>>
