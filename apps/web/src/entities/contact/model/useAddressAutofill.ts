'use client'

import { useCallback, useRef } from 'react'

import { useResolveMunicipality } from '@/entities/geo'

import type { MunicipalityPick } from '../ui/fields/ContactCityField'

export function useAddressAutofill(
  onResolved: (municipality: MunicipalityPick) => void,
): (secondaryText: string) => void {
  const resolveMunicipality = useResolveMunicipality()
  const latestRequest = useRef(0)

  return useCallback(
    (secondaryText: string) => {
      const request = ++latestRequest.current
      void resolveMunicipality(secondaryText).then((municipality) => {
        if (request !== latestRequest.current || !municipality) return
        onResolved({ name: municipality.name, code: municipality.code })
      })
    },
    [resolveMunicipality, onResolved],
  )
}
