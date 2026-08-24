'use client'

import { useColombiaGeo } from '../../query/useColombiaGeo'
import { ColombiaMap } from '../ColombiaMap'

export function ColombiaMapContainer() {
  const { geo, failed } = useColombiaGeo()

  return <ColombiaMap geo={geo} failed={failed} />
}
