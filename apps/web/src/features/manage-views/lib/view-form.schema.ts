import { z } from 'zod'

type TranslateFn = (key: string) => string

export function buildViewFormSchema(t: TranslateFn) {
  return z.object({
    name: z.string().trim().min(1, t('views.nameRequired')).max(120, t('views.nameTooLong')),
    description: z.string().trim().max(300, t('views.descriptionTooLong')),
  })
}

export type ViewFormValues = z.infer<ReturnType<typeof buildViewFormSchema>>
