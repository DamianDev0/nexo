'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { FeatureCollection, Geometry } from 'geojson'
import { drawSvgGrid } from '@/utils/svg-grid'

interface City {
  readonly name: string
  readonly coords: [number, number]
  readonly stat: string
  readonly r: number
  readonly primary?: boolean
  readonly labelSide: 'left' | 'right'
}

const CITIES: City[] = [
  {
    name: 'Bogotá',
    coords: [-74.0721, 4.711],
    stat: '$2.4M pipeline',
    r: 9,
    primary: true,
    labelSide: 'right',
  },
  {
    name: 'Medellín',
    coords: [-75.5636, 6.2442],
    stat: '48 deals',
    r: 7,
    primary: true,
    labelSide: 'left',
  },
  { name: 'Cali', coords: [-76.532, 3.4516], stat: '31 deals', r: 6.5, labelSide: 'left' },
  { name: 'Barranquilla', coords: [-74.7964, 10.9685], stat: '22 deals', r: 6, labelSide: 'right' },
  { name: 'Cartagena', coords: [-75.5144, 10.3997], stat: '18 deals', r: 5.5, labelSide: 'left' },
  { name: 'Bucaramanga', coords: [-73.1198, 7.1193], stat: '14 deals', r: 5, labelSide: 'right' },
  { name: 'Pereira', coords: [-75.6961, 4.8133], stat: '11 deals', r: 4.5, labelSide: 'left' },
  { name: 'Cúcuta', coords: [-72.5078, 7.8939], stat: '8 deals', r: 4, labelSide: 'right' },
]

interface MapColors {
  readonly accent: string
  readonly label: string
  readonly node: string
  readonly stroke: string
  readonly fill: string
  readonly grid: string
  readonly line: string
}

/** Reads a CSS custom property from :root */
function getCssVar(name: string): string {
  return globalThis
    .getComputedStyle(globalThis.document.documentElement)
    .getPropertyValue(name)
    .trim()
}

function readMapColors(): MapColors {
  return {
    accent: getCssVar('--map-accent'),
    label: getCssVar('--map-label'),
    node: getCssVar('--map-node'),
    stroke: getCssVar('--map-stroke'),
    fill: getCssVar('--map-fill'),
    grid: getCssVar('--map-grid'),
    line: getCssVar('--map-line'),
  }
}

// ─── Draw functions (each under cognitive complexity 15) ─────────────

function drawCornerMarks(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  W: number,
  accent: string,
) {
  const cm = svg.append('g').attr('opacity', '0.3')
  cm.append('path')
    .attr('d', 'M16 16 L34 16 M16 16 L16 34')
    .attr('fill', 'none')
    .attr('stroke', accent)
    .attr('stroke-width', '.8')
  cm.append('path')
    .attr('d', `M${W - 16} 16 L${W - 34} 16 M${W - 16} 16 L${W - 16} 34`)
    .attr('fill', 'none')
    .attr('stroke', accent)
    .attr('stroke-width', '.8')
}

function drawDepartments(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  geo: FeatureCollection<Geometry>,
  path: d3.GeoPath,
  colors: MapColors,
) {
  svg
    .append('g')
    .selectAll('path')
    .data(geo.features)
    .enter()
    .append('path')
    .attr('d', (d) => path(d) ?? '')
    .attr('fill', colors.fill)
    .attr('stroke', colors.stroke)
    .attr('stroke-width', '0.45')
    .attr('stroke-linejoin', 'round')
}

function drawPipelineLines(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  projection: d3.GeoProjection,
  colors: MapColors,
) {
  const bogotaXY = projection([-74.0721, 4.711])
  if (!bogotaXY) return

  const lineG = svg.append('g')
  for (const c of CITIES) {
    if (c.name === 'Bogotá') continue
    const pt = projection(c.coords)
    if (!pt) continue
    lineG
      .append('line')
      .attr('x1', bogotaXY[0])
      .attr('y1', bogotaXY[1])
      .attr('x2', pt[0])
      .attr('y2', pt[1])
      .attr('stroke', colors.line)
      .attr('stroke-width', '0.5')
      .attr('stroke-dasharray', '3 4')
  }
}

function drawCityNode(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  city: City,
  px: number,
  py: number,
  colors: MapColors,
) {
  const strokeWidth = city.primary ? '0.9' : '0.65'
  const dotOpacity = city.primary ? '0.9' : '0.65'

  if (city.primary) {
    g.append('circle')
      .attr('cx', px)
      .attr('cy', py)
      .attr('r', city.r + 8)
      .attr('fill', 'none')
      .attr('stroke', colors.accent)
      .attr('stroke-width', '0.4')
      .attr('opacity', '0.15')
  }

  g.append('circle')
    .attr('cx', px)
    .attr('cy', py)
    .attr('r', city.r)
    .attr('fill', colors.node)
    .attr('stroke', colors.accent)
    .attr('stroke-width', strokeWidth)

  g.append('circle')
    .attr('cx', px)
    .attr('cy', py)
    .attr('r', city.r * 0.38)
    .attr('fill', colors.accent)
    .attr('opacity', dotOpacity)

  const isLeft = city.labelSide === 'left'
  const anchor = isLeft ? 'end' : 'start'
  const lx = isLeft ? px - city.r - 5 : px + city.r + 5
  const nameOpacity = city.primary ? '0.85' : '0.65'

  g.append('text')
    .attr('x', lx)
    .attr('y', py - 1)
    .attr('text-anchor', anchor)
    .attr('font-size', city.primary ? '8.5' : '7.5')
    .attr('fill', colors.label)
    .attr('opacity', nameOpacity)
    .attr('letter-spacing', '.05em')
    .text(city.name)

  g.append('text')
    .attr('x', lx)
    .attr('y', py + 9)
    .attr('text-anchor', anchor)
    .attr('font-size', '6.5')
    .attr('fill', colors.label)
    .attr('opacity', '0.6')
    .attr('letter-spacing', '.04em')
    .text(city.stat)
}

function drawCities(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  projection: d3.GeoProjection,
  colors: MapColors,
) {
  const cityG = svg.append('g')
  for (const c of CITIES) {
    const pt = projection(c.coords)
    if (!pt) continue
    drawCityNode(cityG.append('g'), c, pt[0], pt[1], colors)
  }
}

function drawMap(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  geo: FeatureCollection<Geometry>,
  W: number,
  H: number,
  colors: MapColors,
) {
  const projection = d3.geoMercator().fitExtent(
    [
      [20, 40],
      [W - 20, H - 160],
    ],
    geo,
  )
  const path = d3.geoPath().projection(projection)

  drawDepartments(svg, geo, path, colors)
  drawPipelineLines(svg, projection, colors)
  drawCities(svg, projection, colors)
}

// ─── Component ──────────────────────────────────────────────────────

export function ColombiaMap() {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !wrapRef.current) return

    let cancelled = false

    function render() {
      if (!svgRef.current || !wrapRef.current || cancelled) return

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      const W = wrapRef.current.clientWidth
      const H = wrapRef.current.clientHeight
      svg.attr('viewBox', `0 0 ${W} ${H}`)

      const colors = readMapColors()
      drawSvgGrid({ svg, width: W, height: H, color: colors.grid })
      drawCornerMarks(svg, W, colors.accent)

      fetch('/colombia-departments.geojson')
        .then((r) => {
          if (!r.ok) throw new Error(`GeoJSON fetch failed: ${r.status}`)
          return r.json() as Promise<FeatureCollection<Geometry>>
        })
        .then((geo) => {
          if (!cancelled) drawMap(svg, geo, W, H, colors)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          console.error('[ColombiaMap]', err)
          svg
            .append('text')
            .attr('x', W / 2)
            .attr('y', H / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10')
            .attr('fill', colors.label)
            .text('Failed to load map')
        })
    }

    render()

    // Re-render on theme change (next-themes toggles .dark on <html>)
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

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <svg ref={svgRef} className="size-full" />
    </div>
  )
}
