import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ViewSnapshot } from '@/features/manage-contact-views'
import type { ContactView } from '@repo/shared-types'

import { useContactViewsSection } from '@/features/manage-contact-views'

const VIEW: ContactView = {
  id: 'v1',
  ownerId: 'u1',
  name: 'VIP Medellín',
  description: 'Clientes top',
  filters: {},
  advancedFilters: { conditions: [{ field: 'city', operator: 'is', value: 'Medellín' }] },
  columns: {},
  sort: null,
  density: 'comfortable',
  isDefault: false,
  isFavorite: false,
  visibility: 'private',
  position: 0,
  createdAt: '',
  updatedAt: '',
}

const SNAPSHOT: ViewSnapshot = { advanced: [], search: '', sort: null, tableState: {} }

const handlers = () => ({
  onAdvanced: vi.fn(),
  onSearch: vi.fn(),
  onSort: vi.fn(),
  onStatus: vi.fn(),
})

describe('useContactViewsSection', () => {
  it('exposes saved views as smart list items', () => {
    const { result } = renderHook(() =>
      useContactViewsSection([VIEW], SNAPSHOT, handlers(), VIEW.ownerId),
    )
    expect(result.current.items).toEqual([
      { id: 'view:v1', label: 'VIP Medellín', description: 'Clientes top', icon: undefined },
    ])
    expect(result.current.activeView).toBeNull()
  })

  it('marks views as shared when they belong to someone else or the viewer is unknown', () => {
    const other = renderHook(() => useContactViewsSection([VIEW], SNAPSHOT, handlers(), 'u2'))
    const unknown = renderHook(() => useContactViewsSection([VIEW], SNAPSHOT, handlers(), null))

    expect(other.result.current.items[0]?.icon).toBeDefined()
    expect(unknown.result.current.items[0]?.icon).toBe(other.result.current.items[0]?.icon)
  })

  it('marks the view active when the snapshot matches it', () => {
    const { result } = renderHook(() =>
      useContactViewsSection(
        [VIEW],
        { ...SNAPSHOT, advanced: [{ field: 'city', operator: 'is', value: 'Medellín' }] },
        handlers(),
      ),
    )
    expect(result.current.activeView?.id).toBe('v1')
  })

  it('applies the stored view state when its list item is selected', () => {
    const apply = handlers()
    const { result } = renderHook(() => useContactViewsSection([VIEW], SNAPSHOT, apply))
    expect(result.current.selectView('view:v1')).toBe(true)
    expect(apply.onStatus).toHaveBeenCalledWith(null)
    expect(apply.onAdvanced).toHaveBeenCalledWith([
      { field: 'city', operator: 'is', value: 'Medellín' },
    ])
    expect(result.current.selectView('all')).toBe(false)
  })
})
