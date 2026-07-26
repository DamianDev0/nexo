import type * as d3 from 'd3'

interface DrawGridOptions {
  readonly svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  readonly width: number
  readonly height: number
  readonly color: string
  readonly spacing?: number
  readonly opacity?: number
}

/** Draws a faint grid pattern on an SVG — reused across orb and map panels */
export function drawSvgGrid({
  svg,
  width,
  height,
  color,
  spacing = 70,
  opacity = 0.06,
}: DrawGridOptions) {
  const grid = svg.append('g').attr('opacity', String(opacity))

  for (let y = spacing; y < height; y += spacing) {
    grid
      .append('line')
      .attr('x1', 0)
      .attr('y1', y)
      .attr('x2', width)
      .attr('y2', y)
      .attr('stroke', color)
      .attr('stroke-width', '.5')
  }

  for (let x = spacing; x < width; x += spacing) {
    grid
      .append('line')
      .attr('x1', x)
      .attr('y1', 0)
      .attr('x2', x)
      .attr('y2', height)
      .attr('stroke', color)
      .attr('stroke-width', '.5')
  }
}
