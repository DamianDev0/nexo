import { z } from 'zod'

import { OPTION_NAME_MAX } from '../config/option-form.constants'

import type { ActivityTypeFormValues } from './activity-type-edit'
import type { TFunction } from 'i18next'

export function buildActivityTypeFormSchema(t: TFunction) {
  return z.object({
    label: z
      .string()
      .trim()
      .min(1, t('settings.optionForm.errors.nameRequired'))
      .max(OPTION_NAME_MAX, t('settings.optionForm.errors.nameTooLong', { max: OPTION_NAME_MAX })),
    icon: z.string().min(1),
    color: z.string().min(1),
    trackDuration: z.boolean(),
  }) satisfies z.ZodType<ActivityTypeFormValues>
}

export type ActivityTypeFormSchemaValues = z.infer<ReturnType<typeof buildActivityTypeFormSchema>>
