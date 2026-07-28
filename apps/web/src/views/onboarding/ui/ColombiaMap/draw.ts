import * as d3 from 'd3'

import { drawCityNode } from './city-node'
import {
  BOGOTA_COORDS,
  CITIES,
  CORNER_MARK,
  DEPARTMENT_STROKE_WIDTH,
  PIPELINE_LINE,
  PROJECTION_PADDING,
} from './constants'

import type { CityInteraction } from './city-node'
import type { MapColors } from './constants'
import type { FeatureCollection, Geometry } from 'geojson'

export type { CityInteraction }

type SvgSelection = d3.Selection<SVGSVGElement, unknown, null, undefined>

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

function drawCities(
  svg: SvgSelection,
  projection: d3.GeoProjection,
  colors: MapColors,
  interaction: CityInteraction,
) {
  const cityG = svg.append('g')
  for (const c of CITIES) {
    const pt = projection([...c.coords])
    if (!pt) continue
    const g = cityG.append('g').attr('class', 'city-node').style('transition', 'opacity 0.2s')
    drawCityNode(g, c, pt[0], pt[1], colors, interaction)
  }
}

export function drawMap(
  svg: SvgSelection,
  geo: FeatureCollection<Geometry>,
  width: number,
  height: number,
  colors: MapColors,
  interaction: CityInteraction,
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
  drawCities(svg, projection, colors, interaction)
}
