import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SMART_LIST_MAX_VISIBLE } from '@/shared/ui/organisms/data-table/smart-list/config/smart-list.constants'
import { useSmartListViewport } from '@/shared/ui/organisms/data-table/smart-list/model/use-smart-list-viewport'

const TAB_WIDTH = 100

const CAP_PX = `${SMART_LIST_MAX_VISIBLE * TAB_WIDTH}px`

function stubLayout() {
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    const track = this.parentElement
    if (track?.dataset.slot !== 'smart-list-track') return 0
    return [...track.children].indexOf(this) * TAB_WIDTH
  })
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(TAB_WIDTH)
}

function Harness({ count, pinned = false }: Readonly<{ count: number; pinned?: boolean }>) {
  const { ref, style, pinnedWidth } = useSmartListViewport(count, pinned)

  return (
    <div ref={ref} data-testid="viewport" style={style}>
      <output data-testid="pinned-width">{pinnedWidth}</output>
      <span data-slot="smart-list-track">
        {Array.from({ length: count }, (_, index) => (
          <span key={`tab-${index}`} data-pinned={index === 0}>
            tab {index}
          </span>
        ))}
      </span>
    </div>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useSmartListViewport', () => {
  it('leaves the strip unconstrained when everything fits', () => {
    stubLayout()
    render(<Harness count={SMART_LIST_MAX_VISIBLE} />)

    expect(screen.getByTestId('viewport').style.maxWidth).toBe('')
  })

  it('caps the strip the moment there is one tab too many', () => {
    stubLayout()
    render(<Harness count={SMART_LIST_MAX_VISIBLE + 1} />)

    expect(screen.getByTestId('viewport').style.maxWidth).toBe(CAP_PX)
  })

  it('keeps the same cap however many tabs overflow', () => {
    stubLayout()
    render(<Harness count={SMART_LIST_MAX_VISIBLE + 6} />)

    expect(screen.getByTestId('viewport').style.maxWidth).toBe(CAP_PX)
  })

  it('keeps every tab mounted even when the strip is capped', () => {
    stubLayout()
    const overflowing = SMART_LIST_MAX_VISIBLE + 3
    render(<Harness count={overflowing} />)

    expect(screen.getByText(`tab ${overflowing - 1}`)).toBeInTheDocument()
  })

  it('measures the sticky region from layout, so scrolling never changes it', () => {
    stubLayout()
    render(<Harness count={SMART_LIST_MAX_VISIBLE + 4} pinned />)

    const viewport = screen.getByTestId('viewport')
    const before = screen.getByTestId('pinned-width').textContent

    expect(before).toBe(String(TAB_WIDTH))

    act(() => {
      viewport.scrollLeft = 320
      viewport.dispatchEvent(new Event('scroll'))
    })

    expect(screen.getByTestId('pinned-width')).toHaveTextContent(String(TAB_WIDTH))
  })
})
