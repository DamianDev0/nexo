import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'
import { useFormFields } from '@/shared/lib/hooks/useFormFields'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { saveGeneralAction } from '../api/setup-steps.actions'
import { COMPANY_DEFAULT_VALUES } from '../config/company.constants'
import { useStepHydration } from '../query/useStepHydration'
import { useStepMutation } from '../query/useStepMutation'

import type { CompanyFormValues } from './types'
import type { GeneralSettings } from '@repo/shared-types'

export function useStepCompany(onNext: () => void) {
  const {
    control,
    setValue,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<CompanyFormValues>({ defaultValues: COMPANY_DEFAULT_VALUES })
  const { bindField } = useFormFields(setValue)

  useStepHydration({
    queryKey: QUERY_KEYS.settings.general,
    queryFn: settingsService.getGeneral,
    skip: isDirty,
    hydrate: useCallback(
      (data: GeneralSettings) =>
        reset({
          phone: data.business.phone ?? '',
          website: data.business.website ?? '',
          sector: data.industry.sector ?? COMPANY_DEFAULT_VALUES.sector,
        }),
      [reset],
    ),
  })

  const { handleSave, isPending } = useStepMutation({
    mutationFn: async () => {
      const result = await saveGeneralAction(getValues())
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onNext,
    onSuccess: () => reset(getValues(), { keepValues: true }),
  })

  const handleReset = useCallback(() => reset(), [reset])

  return useMemo(
    () => ({ control, bindField, handleSave, handleReset, isDirty, isPending }),
    [control, bindField, handleSave, handleReset, isDirty, isPending],
  )
}
