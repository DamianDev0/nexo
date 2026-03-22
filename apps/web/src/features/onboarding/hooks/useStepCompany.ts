import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sileo } from 'sileo'
import settingsService from '@/core/services/settings.service'

export function useStepCompany(onNext: () => void) {
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [timezone, setTimezone] = useState('America/Bogota')
  const [currency, setCurrency] = useState('COP')
  const [sector, setSector] = useState('technology')

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      settingsService.updateGeneral({
        business: { phone, website },
        i18n: { timezone, currency },
        industry: { sector },
      }),
    onSuccess: () => onNext(),
    onError: (err) => sileo.error({ title: 'Failed to save', description: err.message }),
  })

  const handleSave = useCallback(() => save(), [save])

  return {
    phone,
    setPhone,
    website,
    setWebsite,
    timezone,
    setTimezone,
    currency,
    setCurrency,
    sector,
    setSector,
    handleSave,
    isPending,
  }
}
