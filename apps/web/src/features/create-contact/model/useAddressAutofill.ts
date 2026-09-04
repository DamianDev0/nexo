'use client'

import { useCallback } from 'react'

import { useResolveMunicipality } from '@/entities/geo'

type SetPlaceValue = (
  field: 'city' | 'municipioCode',
  value: string,
  options: { shouldDirty: boolean },
) => void

export function useAddressAutofill(setValue: SetPlaceValue): (secondaryText: string) => void {
  const resolveMunicipality = useResolveMunicipality()

  return useCallback(
    (secondaryText: string) => {
      void resolveMunicipality(secondaryText).then((municipality) => {
        if (!municipality) return
        setValue('city', municipality.name, { shouldDirty: true })
        setValue('municipioCode', municipality.code, { shouldDirty: true })
      })
    },
    [resolveMunicipality, setValue],
  )
}
