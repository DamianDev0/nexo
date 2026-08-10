import { describe, expect, it } from 'vitest'

import { drawSvgGrid } from '@/shared/lib/svg-grid'

type Call = readonly [string, ...unknown[]]

function createFakeSvg() {
  const log: Call[] = []
  const selection = {
    append: (tag: string) => {
      log.push(['append', tag])
      return selection
    },
    attr: (name: string, value: unknown) => {
      log.push(['attr', name, value])
      return selection
    },
  }
  return { svg: selection, log }
}

function lineCalls(x1: unknown, y1: unknown, x2: unknown, y2: unknown, color: string): Call[] {
  return [
    ['append', 'line'],
    ['attr', 'x1', x1],
    ['attr', 'y1', y1],
    ['attr', 'x2', x2],
    ['attr', 'y2', y2],
    ['attr', 'stroke', color],
    ['attr', 'stroke-width', '.5'],
  ]
}

describe('drawSvgGrid', () => {
  it('draws the exact opacity, horizontal and vertical lines for the given bounds', () => {
    const { svg, log } = createFakeSvg()

    drawSvgGrid({
      svg: svg as unknown as Parameters<typeof drawSvgGrid>[0]['svg'],
      width: 150,
      height: 100,
      color: '#abc',
      spacing: 50,
      opacity: 0.25,
    })

    expect(log).toEqual([
      ['append', 'g'],
      ['attr', 'opacity', '0.25'],
      ...lineCalls(0, 50, 150, 50, '#abc'),
      ...lineCalls(50, 0, 50, 100, '#abc'),
      ...lineCalls(100, 0, 100, 100, '#abc'),
    ])
  })

  it('excludes a line exactly at the boundary, never running one past it', () => {
    const { svg, log } = createFakeSvg()

    drawSvgGrid({
      svg: svg as unknown as Parameters<typeof drawSvgGrid>[0]['svg'],
      width: 50,
      height: 50,
      color: '#000',
      spacing: 50,
    })

    expect(log).toEqual([
      ['append', 'g'],
      ['attr', 'opacity', String(0.06)],
    ])
  })

  it('uses the default spacing and opacity when not provided', () => {
    const { svg, log } = createFakeSvg()

    drawSvgGrid({
      svg: svg as unknown as Parameters<typeof drawSvgGrid>[0]['svg'],
      width: 140,
      height: 71,
      color: '#111',
    })

    expect(log).toEqual([
      ['append', 'g'],
      ['attr', 'opacity', '0.06'],
      ...lineCalls(0, 70, 140, 70, '#111'),
      ...lineCalls(70, 0, 70, 71, '#111'),
    ])
  })

  it('draws nothing but the opacity group when both bounds are smaller than the spacing', () => {
    const { svg, log } = createFakeSvg()

    drawSvgGrid({
      svg: svg as unknown as Parameters<typeof drawSvgGrid>[0]['svg'],
      width: 10,
      height: 10,
      color: '#fff',
      spacing: 70,
      opacity: 0.5,
    })

    expect(log).toEqual([
      ['append', 'g'],
      ['attr', 'opacity', '0.5'],
    ])
  })
})
