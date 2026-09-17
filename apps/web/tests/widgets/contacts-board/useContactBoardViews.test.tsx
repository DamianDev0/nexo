import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ContactViewsTable } from '@/widgets/contacts-board/lib/contact-board-lists'

import { useContactBoardViews } from '@/widgets/contacts-board/model/useContactBoardViews'

const useBoardViews = vi.fn((args: { table: unknown }) => args)

vi.mock('@/widgets/records-board', () => ({
  useBoardViews: (args: { table: unknown }) => useBoardViews(args),
}))

const TABLE: ContactViewsTable = {
  advanced: [],
  search: 'ana',
  sort: null,
  isFiltered: true,
  handleAdvanced: vi.fn(),
  handleSearch: vi.fn(),
  handleSort: vi.fn(),
  handleStatus: vi.fn(),
}

function render(table: ContactViewsTable) {
  return renderHook(
    ({ current }) =>
      useContactBoardViews({
        table: current,
        workspace: {},
        items: [],
        fallbackActiveId: 'all',
        applyTableState: vi.fn(),
        setListOrder: vi.fn(),
      }),
    { initialProps: { current: table } },
  )
}

describe('useContactBoardViews', () => {
  it('hands the generic board a stable table while the contact table does not change', () => {
    const { rerender } = render(TABLE)
    const first = useBoardViews.mock.calls[0]?.[0].table

    rerender({ current: { ...TABLE } })

    expect(useBoardViews.mock.calls[1]?.[0].table).toBe(first)
  })

  it('rebuilds the table once the search changes', () => {
    useBoardViews.mockClear()
    const { rerender } = render(TABLE)
    const first = useBoardViews.mock.calls[0]?.[0].table

    rerender({ current: { ...TABLE, search: 'beto' } })

    expect(useBoardViews.mock.calls[1]?.[0].table).not.toBe(first)
  })
})
