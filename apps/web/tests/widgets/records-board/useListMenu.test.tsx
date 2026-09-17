import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ObjectView } from '@repo/shared-types'

import { useListMenu } from '@/widgets/records-board/model/useListMenu'

const push = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

vi.mock('@/entities/object-descriptor', () => ({
  useObjectDescriptor: () => ({ routes: { listSettings: '/settings/contacts/status' } }),
}))

type MenuActionLike = { key: string; label: string; icon: unknown; onSelect: unknown }

const viewActions = vi.fn((): MenuActionLike[] => [])

vi.mock('@/features/manage-views', () => ({
  useViewTabMenu: () => ({
    itemMenu: viewActions,
    menuLabel: 'views.menu',
    target: null,
    openMode: null,
    close: vi.fn(),
  }),
}))

const VIEWS: ObjectView[] = []

describe('useListMenu', () => {
  it('gives precedence to view actions when the item is a saved view with actions', () => {
    const viewSpecificActions = [
      { key: 'duplicate', label: 'views.duplicate', icon: vi.fn(), onSelect: vi.fn() },
    ]
    viewActions.mockReturnValueOnce(viewSpecificActions)
    const { result } = renderHook(() => useListMenu(VIEWS, 'viewer-1'))

    const actions = result.current.itemMenu({ id: 'view:v1', label: 'My view', count: 0 })

    expect(actions).toBe(viewSpecificActions)
  })

  it('returns no actions for a pinned smart list', () => {
    viewActions.mockReturnValueOnce([])
    const { result } = renderHook(() => useListMenu(VIEWS, 'viewer-1'))

    const actions = result.current.itemMenu({ id: 'all', label: 'All', count: 0, pinned: true })

    expect(actions).toEqual([])
  })

  it('offers a manage action for an unpinned smart list with no view actions', () => {
    viewActions.mockReturnValueOnce([])
    const { result } = renderHook(() => useListMenu(VIEWS, 'viewer-1'))

    const actions = result.current.itemMenu({ id: 'new', label: 'Nuevo', count: 0 })

    expect(actions).toHaveLength(1)
    expect(actions[0]?.key).toBe('manage')

    actions[0]?.onSelect()
    expect(push).toHaveBeenCalledWith('/settings/contacts/status')
  })
})
