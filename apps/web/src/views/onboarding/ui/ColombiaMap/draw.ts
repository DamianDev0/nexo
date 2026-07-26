import * as d3 from 'd3'

import {
  BOGOTA_COORDS,
  CITIES,
  CITY_NODE,
  CORNER_MARK,
  DEPARTMENT_STROKE_WIDTH,
  PIPELINE_LINE,
  PROJECTION_PADDING,
} from './constants'

import type { City, MapColors } from './constants'
import type { FeatureCollection, Geometry } from 'geojson'

type SvgSelection = d3.Selection<SVGSVGElement, unknown, null, undefined>
type GroupSelection = d3.Selection<SVGGElement, unknown, null, undefined>

export function drawCornerMarks(svg: SvgSelection, width: number, accent: string) {
  const { inset, length, opacity, strokeWidth } = CORNER_MARK
  const cm = svg.append('g').attr('opacity', opacity)
  cm.append('path')
    .attr('d', `M${inset} ${inset} L${length} ${inset} M${inset} ${inset} L${inset} ${length}`)
    .attr('fill', 'none')
    .attr('stroke', accent)
    .attr('stroke-width', strokeWidth)
  cm.append('path')
    .attr(
      'd',
      `M${width - inset} ${inset} L${width - length} ${inset} M${width - inset} ${inset} L${width - inset} ${length}`,
    )
    .attr('fill', 'none')
    .attr('stroke', accent)
    .attr('stroke-width', strokeWidth)
}

function drawDepartments(
  svg: SvgSelection,
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
    .attr('stroke-width', DEPARTMENT_STROKE_WIDTH)
    .attr('stroke-linejoin', 'round')
}

function drawPipelineLines(svg: SvgSelection, projection: d3.GeoProjection, colors: MapColors) {
  const bogotaXY = projection([...BOGOTA_COORDS])
  if (!bogotaXY) return

  const lineG = svg.append('g')
  for (const c of CITIES) {
    if (c.name === 'Bogotá') continue
    const pt = projection([...c.coords])
    if (!pt) continue
    lineG
      .append('line')
      .attr('x1', bogotaXY[0])
      .attr('y1', bogotaXY[1])
      .attr('x2', pt[0])
      .attr('y2', pt[1])
      .attr('stroke', colors.line)
      .attr('stroke-width', PIPELINE_LINE.strokeWidth)
      .attr('stroke-dasharray', PIPELINE_LINE.dashArray)
  }
}

function drawCityNode(g: GroupSelection, city: City, px: number, py: number, colors: MapColors) {
  const strokeWidth = city.primary ? CITY_NODE.primaryStrokeWidth : CITY_NODE.secondaryStrokeWidth
  const dotOpacity = city.primary ? CITY_NODE.primaryDotOpacity : CITY_NODE.secondaryDotOpacity

  if (city.primary) {
    g.append('circle')
      .attr('cx', px)
      .attr('cy', py)
      .attr('r', city.r + CITY_NODE.haloOffset)
      .attr('fill', 'none')
      .attr('stroke', colors.accent)
      .attr('stroke-width', CITY_NODE.haloStrokeWidth)
      .attr('opacity', CITY_NODE.haloOpacity)
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
    .attr('r', city.r * CITY_NODE.dotRatio)
    .attr('fill', colors.accent)
    .attr('opacity', dotOpacity)

  const isLeft = city.labelSide === 'left'
  const anchor = isLeft ? 'end' : 'start'
  const lx = isLeft ? px - city.r - CITY_NODE.labelGap : px + city.r + CITY_NODE.labelGap
  const nameOpacity = city.primary ? CITY_NODE.primaryNameOpacity : CITY_NODE.secondaryNameOpacity

  g.append('text')
    .attr('x', lx)
    .attr('y', py - 1)
    .attr('text-anchor', anchor)
    .attr('font-size', city.primary ? CITY_NODE.primaryFontSize : CITY_NODE.secondaryFontSize)
    .attr('fill', colors.label)
    .attr('opacity', nameOpacity)
    .attr('letter-spacing', CITY_NODE.nameLetterSpacing)
    .text(city.name)

  g.append('text')
    .attr('x', lx)
    .attr('y', py + 9)
    .attr('text-anchor', anchor)
    .attr('font-size', CITY_NODE.statFontSize)
    .attr('fill', colors.label)
    .attr('opacity', CITY_NODE.statOpacity)
    .attr('letter-spacing', CITY_NODE.statLetterSpacing)
    .text(city.stat)
}

function drawCities(svg: SvgSelection, projection: d3.GeoProjection, colors: MapColors) {
  const cityG = svg.append('g')
  for (const c of CITIES) {
    const pt = projection([...c.coords])
    if (!pt) continue
    drawCityNode(cityG.append('g'), c, pt[0], pt[1], colors)
  }
}

export function drawMap(
  svg: SvgSelection,
  geo: FeatureCollection<Geometry>,
  width: number,
  height: number,
  colors: MapColors,
) {
  const projection = d3.geoMercator().fitExtent(
    [
      [PROJECTION_PADDING.left, PROJECTION_PADDING.top],
      [width - PROJECTION_PADDING.right, height - PROJECTION_PADDING.bottom],
    ],
    geo,
  )
  const path = d3.geoPath().projection(projection)

  drawDepartments(svg, geo, path, colors)
  drawPipelineLines(svg, projection, colors)
  drawCities(svg, projection, colors)
}
