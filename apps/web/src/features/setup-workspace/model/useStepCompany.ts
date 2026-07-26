import { IndustrySector } from '@repo/shared-types'
import { CO_TIMEZONE, CURRENCY_CODE } from '@repo/shared-utils'
import { useForm } from 'react-hook-form'

import settingsService from '@/shared/api/services/settings.service'

import { useStepMutation } from './useStepMutation'

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
  const { watch, setValue, getValues } = useForm<CompanyFormValues>({
    defaultValues: DEFAULT_VALUES,
  })
  const values = watch()

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
