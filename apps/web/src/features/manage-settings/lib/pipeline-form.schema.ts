import { z } from 'zod'

import { PIPELINE_NAME_MAX } from '../config/pipelines.constants'

import type { TFunction } from 'i18next'

export function buildPipelineFormSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('settings.optionForm.errors.nameRequired'))
      .max(
        PIPELINE_NAME_MAX,
        t('settings.optionForm.errors.nameTooLong', { max: PIPELINE_NAME_MAX }),
      ),
  })
}

export type PipelineFormValues = z.infer<ReturnType<typeof buildPipelineFormSchema>>
