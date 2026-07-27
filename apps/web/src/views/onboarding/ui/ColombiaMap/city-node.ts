import * as d3 from 'd3'

import { CITY_DIM_OPACITY, CITY_HIT_RADIUS_OFFSET, CITY_NODE } from './constants'

import type { City, MapColors } from './constants'

export interface CityInteraction {
  readonly dealsLabel: string
  readonly onHover: (city: City, x: number, y: number) => void
  readonly onLeave: () => void
}

type GroupSelection = d3.Selection<SVGGElement, unknown, null, undefined>

export function drawCityNode(
  g: GroupSelection,
  city: City,
  px: number,
  py: number,
  colors: MapColors,
  interaction: CityInteraction,
) {
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
    .text(`${city.deals} ${interaction.dealsLabel}`)

  g.append('circle')
    .attr('cx', px)
    .attr('cy', py)
    .attr('r', city.r + CITY_HIT_RADIUS_OFFSET)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('mouseenter', function () {
      const el = this as SVGCircleElement
      d3.select(el.ownerSVGElement).selectAll('.city-node').attr('opacity', CITY_DIM_OPACITY)
      d3.select(el.parentElement).attr('opacity', 1)
      interaction.onHover(city, px, py - city.r)
    })
    .on('mouseleave', function () {
      const el = this as SVGCircleElement
      d3.select(el.ownerSVGElement).selectAll('.city-node').attr('opacity', 1)
      interaction.onLeave()
    })
}
