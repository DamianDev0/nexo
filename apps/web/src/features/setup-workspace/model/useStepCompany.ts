import { useState } from 'react'

import settingsService from '@/shared/api/services/settings.service'

import { useStepMutation } from './useStepMutation'

export function useStepCompany(onNext: () => void) {
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [sector, setSector] = useState('technology')

  const { handleSave, isPending } = useStepMutation({
    mutationFn: () =>
      settingsService.updateGeneral({
        business: { phone, website },
        i18n: { timezone: 'America/Bogota', currency: 'COP' },
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
