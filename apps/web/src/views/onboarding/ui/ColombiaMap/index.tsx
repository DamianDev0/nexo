'use client'

import { useColombiaMap } from './useColombiaMap'

import type { FeatureCollection, Geometry } from 'geojson'

interface ColombiaMapProps {
  readonly geo: FeatureCollection<Geometry> | null
  readonly failed: boolean
}

export function ColombiaMap({ geo, failed }: Readonly<ColombiaMapProps>) {
  const { svgRef, wrapRef } = useColombiaMap({ geo, failed })

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <svg ref={svgRef} className="size-full" />
    </div>
  )
}
