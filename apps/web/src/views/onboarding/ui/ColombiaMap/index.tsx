'use client'

import { useColombiaMap } from './useColombiaMap'

export function ColombiaMap() {
  const { svgRef, wrapRef } = useColombiaMap()

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <svg ref={svgRef} className="size-full" />
    </div>
  )
}
