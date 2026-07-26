import { IndustrySector } from '@repo/shared-types'
import { CO_TIMEZONE, CURRENCY_CODE } from '@repo/shared-utils'
import { useState } from 'react'

import settingsService from '@/shared/api/services/settings.service'

import { useStepMutation } from './useStepMutation'

export function useStepCompany(onNext: () => void) {
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [sector, setSector] = useState<IndustrySector>(IndustrySector.TECNOLOGIA)

  const { handleSave, isPending } = useStepMutation({
    mutationFn: () =>
      settingsService.updateGeneral({
        business: { phone, website },
        i18n: { timezone: CO_TIMEZONE, currency: CURRENCY_CODE },
        industry: { sector },
      }),
    onNext,
  })

  return {
    phone,
    setPhone,
    website,
    setWebsite,
    sector,
    setSector,
    handleSave,
    isPending,
  }
}
