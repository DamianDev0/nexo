import { IndustrySector } from '@repo/shared-types'
import { CO_TIMEZONE, CURRENCY_CODE } from '@repo/shared-utils'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/config/query-keys'

import { useStepHydration } from './useStepHydration'
import { useStepMutation } from './useStepMutation'

import type { GeneralSettings } from '@repo/shared-types'

interface CompanyFormValues {
  phone: string
  website: string
  sector: IndustrySector
}

const DEFAULT_VALUES: CompanyFormValues = {
  phone: '',
  website: '',
  sector: IndustrySector.TECNOLOGIA,
}

export function useStepCompany(onNext: () => void) {
  const { watch, setValue, getValues, reset } = useForm<CompanyFormValues>({
    defaultValues: DEFAULT_VALUES,
  })
  const values = watch()

  useStepHydration({
    queryKey: QUERY_KEYS.settings.general,
    queryFn: settingsService.getGeneral,
    hydrate: useCallback(
      (data: GeneralSettings) =>
        reset({
          phone: data.business.phone ?? '',
          website: data.business.website ?? '',
          sector: data.industry.sector ?? DEFAULT_VALUES.sector,
        }),
      [reset],
    ),
  })

  const { handleSave, isPending } = useStepMutation({
    mutationFn: () => {
      const form = getValues()
      return settingsService.updateGeneral({
        business: { phone: form.phone, website: form.website },
        i18n: { timezone: CO_TIMEZONE, currency: CURRENCY_CODE },
        industry: { sector: form.sector },
      })
    },
    onNext,
  })

  return {
    phone: values.phone,
    setPhone: (v: string) => setValue('phone', v),
    website: values.website,
    setWebsite: (v: string) => setValue('website', v),
    sector: values.sector,
    setSector: (v: IndustrySector) => setValue('sector', v),
    handleSave,
    isPending,
  }
}
