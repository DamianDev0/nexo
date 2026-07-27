'use client'

import * as d3 from 'd3'
import { t } from 'i18next'
import { useEffect, useRef } from 'react'

import { drawSvgGrid } from '@/shared/lib/svg-grid'

import { ERROR_TEXT, GEOJSON_URL, MAP_CSS_VARS } from './constants'
import { drawCornerMarks, drawMap } from './draw'

import type { City, MapColors } from './constants'
import type { FeatureCollection, Geometry } from 'geojson'
import type { RefObject } from 'react'

function cityTooltipHtml(city: City): string {
  return `
    <div class="relative rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p class="text-xs font-bold tracking-tight text-popover-foreground">${city.name}</p>
      <p class="mt-0.5 whitespace-nowrap text-[10px] leading-4 text-muted-foreground">${city.deals} ${t('onboarding.map.activeDeals')} · ${city.pipelineCop} ${t('onboarding.map.inPipeline')}</p>
      <p class="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide leading-4 text-primary-deep dark:text-primary">${t(`onboarding.map.sectors.${city.key}`)}</p>
      <span class="absolute left-1/2 top-full -mt-1 size-2 -translate-x-1/2 rotate-45 border-b border-r border-border bg-popover"></span>
    </div>
  `
}

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

      d3.select(wrapRef.current).selectAll('[data-slot="map-tooltip"]').remove()
      const tooltip = d3
        .select(wrapRef.current)
        .append('div')
        .attr('data-slot', 'map-tooltip')
        .attr(
          'class',
          'pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-full',
        )

      const interaction = {
        dealsLabel: t('onboarding.map.deals'),
        onHover: (city: City, x: number, y: number) => {
          tooltip
            .html(cityTooltipHtml(city))
            .style('left', `${x}px`)
            .style('top', `${y - 10}px`)
            .classed('hidden', false)
        },
        onLeave: () => {
          tooltip.classed('hidden', true)
        },
      }

      fetch(GEOJSON_URL)
        .then((r) => {
          if (!r.ok) throw new Error(`GeoJSON fetch failed: ${r.status}`)
          return r.json() as Promise<FeatureCollection<Geometry>>
        })
        .then((geo) => {
          if (!cancelled) drawMap(svg, geo, width, height, colors, interaction)
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
