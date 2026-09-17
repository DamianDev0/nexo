import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { useContactsTable } from '@/features/filter-contacts'
import type { ContactView } from '@repo/shared-types'

import { EMPTY_TABLE_STATE } from '@/widgets/contacts-board/config/board-empty.constants'
import { useBoardViews } from '@/widgets/contacts-board/model/useBoardViews'

vi.mock('@/entities/session', () => ({ useAuth: () => ({ data: { id: 'viewer-1' } }) }))

const reorder = vi.fn()

vi.mock('@/features/manage-views', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/manage-views')>()),
  useViewsAdmin: () => ({
    create: vi.fn(),
    update: vi.fn(),
    duplicate: vi.fn(),
    reorder,
    remove: vi.fn(),
    isPending: false,
  }),
}))

function buildView(overrides: Partial<ContactView> = {}): ContactView {
  return {
    id: 'v1',
    ownerId: 'viewer-1',
    name: 'My view',
    description: null,
    filters: {},
    advancedFilters: null,
    columns: {},
    sort: null,
    density: 'comfortable',
    isDefault: false,
    isFavorite: false,
    visibility: 'private',
    position: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeTable(
  overrides: Partial<ReturnType<typeof useContactsTable>> = {},
): ReturnType<typeof useContactsTable> {
  return {
    advanced: [],
    search: '',
    sort: null,
    isFiltered: false,
    handleAdvanced: vi.fn(),
    handleSearch: vi.fn(),
    handleSort: vi.fn(),
    handleStatus: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useContactsTable>
}

describe('useBoardViews', () => {
  beforeEach(() => reorder.mockClear())

  it('applies the local reorder immediately and sends only the owned view ids once', () => {
    const views = [buildView({ id: 'v1', position: 0 }), buildView({ id: 'v2', position: 1 })]
    const setListOrder = vi.fn()
    const table = makeTable()

    const { result } = renderHook(() =>
      useBoardViews({
        table,
        workspace: { views, tableState: EMPTY_TABLE_STATE },
        items: [],
        fallbackActiveId: 'all',
        applyTableState: vi.fn(),
        setListOrder,
      }),
    )

    act(() => result.current.reorderLists(['view:v2', 'view:v1']))

    expect(setListOrder).toHaveBeenCalledWith(['view:v2', 'view:v1'])
    expect(reorder).toHaveBeenCalledOnce()
    expect(reorder).toHaveBeenCalledWith(['v2', 'v1'])
  })

  it('skips the reorder mutation when fewer than two owned views are in the new order', () => {
    const views = [buildView({ id: 'v1', ownerId: 'someone-else' })]
    const table = makeTable()

    const { result } = renderHook(() =>
      useBoardViews({
        table,
        workspace: { views, tableState: EMPTY_TABLE_STATE },
        items: [],
        fallbackActiveId: 'all',
        applyTableState: vi.fn(),
        setListOrder: vi.fn(),
      }),
    )

    act(() => result.current.reorderLists(['view:v1', 'new']))

    expect(reorder).not.toHaveBeenCalled()
  })

  it('includes the current sort in the snapshot handed to save-as-view', () => {
    const table = makeTable({ sort: { field: 'firstName', direction: 'asc' } })

    const { result } = renderHook(() =>
      useBoardViews({
        table,
        workspace: { views: [], tableState: EMPTY_TABLE_STATE },
        items: [],
        fallbackActiveId: 'all',
        applyTableState: vi.fn(),
        setListOrder: vi.fn(),
      }),
    )

    expect(result.current.viewSnapshot.sort).toEqual({ field: 'firstName', direction: 'asc' })
  })

  it('updates the snapshot sort once the table sort changes', () => {
    const table = makeTable({ sort: null })

    const { result, rerender } = renderHook(
      ({ sort }: { sort: ReturnType<typeof useContactsTable>['sort'] }) =>
        useBoardViews({
          table: makeTable({ sort }),
          workspace: { views: [], tableState: EMPTY_TABLE_STATE },
          items: [],
          fallbackActiveId: 'all',
          applyTableState: vi.fn(),
          setListOrder: vi.fn(),
        }),
      { initialProps: { sort: table.sort } },
    )

    expect(result.current.viewSnapshot.sort).toBeNull()

    rerender({ sort: { field: 'email', direction: 'desc' } })

    expect(result.current.viewSnapshot.sort).toEqual({ field: 'email', direction: 'desc' })
  })
})
