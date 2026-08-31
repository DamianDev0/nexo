import { z } from 'zod'

import { fieldHasOptions } from './custom-field-edit'

import type { CustomFieldType } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export function buildFieldFormSchema(t: TFunction) {
  return z
    .object({
      label: z.string().trim().min(1, t('settings.optionForm.errors.nameRequired')),
      type: z.custom<CustomFieldType>((value) => typeof value === 'string' && value.length > 0),
      required: z.boolean(),
      showInForm: z.boolean(),
      options: z.array(z.object({ value: z.string() })),
    })
    .superRefine((values, ctx) => {
      if (!fieldHasOptions(values.type)) return
      if (values.options.some((option) => option.value.trim().length > 0)) return
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: t('settings.fields.optionsRequired'),
      })
    })
}

export type FieldFormSchemaValues = z.infer<ReturnType<typeof buildFieldFormSchema>>
