'use client'

import { useCallback } from 'react'

import { useResolveMunicipality } from '@/entities/geo'

import type { MunicipalityPick } from '../ui/fields/ContactCityField'

export function useAddressAutofill(
  onResolved: (municipality: MunicipalityPick) => void,
): (secondaryText: string) => void {
  const resolveMunicipality = useResolveMunicipality()

  return useCallback(
    (secondaryText: string) => {
      void resolveMunicipality(secondaryText).then((municipality) => {
        if (municipality) onResolved({ name: municipality.name, code: municipality.code })
      })
    },
    [resolveMunicipality, onResolved],
  )
}
