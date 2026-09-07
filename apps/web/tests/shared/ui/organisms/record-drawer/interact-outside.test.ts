import { describe, expect, it } from 'vitest'

import { isFloatingLayerTarget } from '@/shared/ui/organisms/record-drawer/lib/interact-outside'

function nodeInside(wrapperHtml: string): Element {
  document.body.innerHTML = `${wrapperHtml}<span id="probe"></span></div>`
  return document.getElementById('probe') as Element
}

describe('isFloatingLayerTarget', () => {
  it('keeps the drawer open for composers, poppers and dialogs', () => {
    expect(isFloatingLayerTarget(nodeInside('<div data-slot="composer">'))).toBe(true)
    expect(isFloatingLayerTarget(nodeInside('<div data-radix-popper-content-wrapper>'))).toBe(true)
    expect(isFloatingLayerTarget(nodeInside('<div role="dialog">'))).toBe(true)
  })

  it('lets clicks on page content dismiss the drawer', () => {
    expect(isFloatingLayerTarget(nodeInside('<div class="table">'))).toBe(false)
    expect(isFloatingLayerTarget(null)).toBe(false)
  })
})
