import { render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSmartListReveal } from '@/shared/ui/organisms/data-table/smart-list/model/use-smart-list-reveal'

const TAB_WIDTH = 100
const VIEW_WIDTH = 400
const IDS = ['all', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']

function stubViewport(scrollLeft: number) {
  const scrollTo = vi.fn()
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    value: scrollTo,
    configurable: true,
    writable: true,
  })
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(VIEW_WIDTH)
  vi.spyOn(Element.prototype, 'scrollLeft', 'get').mockReturnValue(scrollLeft)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const track = this.parentElement
    const index =
      track?.dataset.slot === 'smart-list-track' ? [...track.children].indexOf(this) : null
    const left = index === null ? 0 : index * TAB_WIDTH
    return { left, right: left + TAB_WIDTH, width: TAB_WIDTH } as DOMRect
  })
  return scrollTo
}

function Harness({ activeId, pinnedWidth }: Readonly<{ activeId: string; pinnedWidth: number }>) {
  const ref = useRef<HTMLDivElement>(null)
  useSmartListReveal(ref, activeId, pinnedWidth)

  return (
    <div ref={ref}>
      <span data-slot="smart-list-track">
        {IDS.map((id) => (
          <span key={id} data-tab-id={id}>
            {id}
          </span>
        ))}
      </span>
    </div>
  )
}

function reveal(activeId: string, scrollLeft = 0, pinnedWidth = 0) {
  const scrollTo = stubViewport(scrollLeft)
  render(<Harness activeId={activeId} pinnedWidth={pinnedWidth} />)
  return scrollTo
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useSmartListReveal', () => {
  it('leaves the scroll alone when the active tab is already visible', () => {
    expect(reveal('a')).not.toHaveBeenCalled()
  })

  it('scrolls right so the trailing edge of a later tab comes into view', () => {
    expect(reveal('i')).toHaveBeenCalledWith({
      left: 10 * TAB_WIDTH - VIEW_WIDTH,
      behavior: 'smooth',
    })
  })

  it('scrolls back past the sticky region when the active tab sits behind it', () => {
    expect(reveal('b', 300, TAB_WIDTH)).toHaveBeenCalledWith({
      left: 2 * TAB_WIDTH - TAB_WIDTH,
      behavior: 'smooth',
    })
  })

  it('never scrolls to a negative offset', () => {
    expect(reveal('all', 300, 200)).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })
  })
})
