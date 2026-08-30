'use client'

import { useCallback, useMemo, useState } from 'react'
import { useFormState } from 'react-hook-form'

import { useStepCompany } from '@/features/setup-workspace'

export function useCompanySection(onSaved: () => void) {
  const company = useStepCompany(onSaved)
  const { dirtyFields } = useFormState({ control: company.control })
  const [confirmOpen, setConfirmOpen] = useState(false)

  const sectorChanged = dirtyFields.sector === true

  const handleSave = useCallback(() => {
    if (sectorChanged) {
      setConfirmOpen(true)
      return
    }
    company.handleSave()
  }, [company, sectorChanged])

  const confirm = useCallback(() => {
    setConfirmOpen(false)
    company.handleSave()
  }, [company])

  const cancel = useCallback(() => setConfirmOpen(false), [])

  return useMemo(
    () => ({
      ...company,
      handleSave,
      sectorConfirm: { open: confirmOpen, confirm, cancel },
    }),
    [company, handleSave, confirmOpen, confirm, cancel],
  )
}
