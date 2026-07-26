'use client'

import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

import { drawSvgGrid } from '@/shared/lib/svg-grid'

import { ERROR_TEXT, GEOJSON_URL, MAP_CSS_VARS } from './constants'
import { drawCornerMarks, drawMap } from './draw'

import type { MapColors } from './constants'
import type { FeatureCollection, Geometry } from 'geojson'
import type { RefObject } from 'react'

function getCssVar(name: string): string {
  return globalThis
    .getComputedStyle(globalThis.document.documentElement)
    .getPropertyValue(name)
    .trim()
}

function readMapColors(): MapColors {
  return {
    accent: getCssVar(MAP_CSS_VARS.accent),
    label: getCssVar(MAP_CSS_VARS.label),
    node: getCssVar(MAP_CSS_VARS.node),
    stroke: getCssVar(MAP_CSS_VARS.stroke),
    fill: getCssVar(MAP_CSS_VARS.fill),
    grid: getCssVar(MAP_CSS_VARS.grid),
    line: getCssVar(MAP_CSS_VARS.line),
  }
}

interface UseColombiaMapResult {
  readonly svgRef: RefObject<SVGSVGElement | null>
  readonly wrapRef: RefObject<HTMLDivElement | null>
}

export function useColombiaMap(): UseColombiaMapResult {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !wrapRef.current) return

    let cancelled = false

    function render() {
      if (!svgRef.current || !wrapRef.current || cancelled) return

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      const width = wrapRef.current.clientWidth
      const height = wrapRef.current.clientHeight
      svg.attr('viewBox', `0 0 ${width} ${height}`)

      const colors = readMapColors()
      drawSvgGrid({ svg, width, height, color: colors.grid })
      drawCornerMarks(svg, width, colors.accent)

      fetch(GEOJSON_URL)
        .then((r) => {
          if (!r.ok) throw new Error(`GeoJSON fetch failed: ${r.status}`)
          return r.json() as Promise<FeatureCollection<Geometry>>
        })
        .then((geo) => {
          if (!cancelled) drawMap(svg, geo, width, height, colors)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          console.error('[ColombiaMap]', err)
          svg
            .append('text')
            .attr('x', width / 2)
            .attr('y', height / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', ERROR_TEXT.fontSize)
            .attr('fill', colors.label)
            .text(ERROR_TEXT.message)
        })
    }

    render()

    const observer = new MutationObserver(render)
    observer.observe(globalThis.document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [])

  return { svgRef, wrapRef }
}
