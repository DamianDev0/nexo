import { TAXONOMY_DESCRIPTION_MAX } from '@repo/shared-types'
import { z } from 'zod'

import { OPTION_NAME_MAX } from '../config/option-form.constants'

import type { OptionFormValues } from '../model/types'
import type { TFunction } from 'i18next'

export function buildOptionFormSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('settings.optionForm.errors.nameRequired'))
      .max(OPTION_NAME_MAX, t('settings.optionForm.errors.nameTooLong', { max: OPTION_NAME_MAX })),
    description: z
      .string()
      .trim()
      .max(
        TAXONOMY_DESCRIPTION_MAX,
        t('settings.optionForm.errors.descriptionTooLong', { max: TAXONOMY_DESCRIPTION_MAX }),
      ),
  }) satisfies z.ZodType<OptionFormValues>
}

export type OptionFormSchemaValues = z.infer<ReturnType<typeof buildOptionFormSchema>>

export function buildReassignSchema(t: TFunction, entities: string) {
  return z.object({
    target: z.string().min(1, t('settings.reassign.errors.targetRequired', { entities })),
  })
}

export type ReassignFormValues = z.infer<ReturnType<typeof buildReassignSchema>>
