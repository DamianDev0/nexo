import { DealStatus } from '@repo/shared-types'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildContact } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactActivity, DealListItem } from '@repo/shared-types'

import { useContactDetail } from '@/views/contact-detail/model/useContactDetail'

const CONTACT = buildContact({ id: 'c-1' })

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: push, refresh: vi.fn() }),
  usePathname: () => '/contacts/c-1',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/entities/contact', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/contact')>()),
  useContact: () => ({ contact: CONTACT, isPending: false, isError: false, retry: vi.fn() }),
  useContactTimeline: () => ({ activities: ACTIVITIES }),
}))

vi.mock('@/entities/contact-taxonomy', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/contact-taxonomy')>()),
  useContactTaxonomy: () => ({
    statusByKey: new Map(),
    sourceByKey: new Map(),
    lifecycleByKey: new Map(),
  }),
}))

vi.mock('@/entities/deal', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/deal')>()),
  useContactDeals: () => ({ deals: DEALS, isLoading: false, isError: false }),
}))

vi.mock('@/entities/tag', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/tag')>()),
  useTagCatalog: () => new Map(),
}))

let capturedOnArchived: (() => void) | undefined
vi.mock('@/features/archive-contact', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/archive-contact')>()),
  useArchiveContactDialog: (onArchived?: () => void) => {
    capturedOnArchived = onArchived
    return { target: null, isPending: false, ask: vi.fn(), close: vi.fn(), confirm: vi.fn() }
  },
}))

let capturedOnMerged: (() => void) | undefined
vi.mock('@/features/merge-contacts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/merge-contacts')>()),
  useMergeContactsDialog: (_winner: unknown, onMerged?: () => void) => {
    capturedOnMerged = onMerged
    return {
      open: false,
      loser: null,
      rows: [],
      fields: [],
      isPending: false,
      ask: vi.fn(),
      close: vi.fn(),
      pickLoser: vi.fn(),
      toggleField: vi.fn(),
      confirm: vi.fn(),
    }
  },
}))

const ACTIVITIES: ContactActivity[] = [
  {
    id: 'a1',
    activityType: 'note',
    title: null,
    description: null,
    dueDate: null,
    completedAt: null,
    status: 'pending',
    priority: 'medium',
    durationMinutes: null,
    assignedToId: null,
    createdById: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'a2',
    activityType: 'task',
    title: null,
    description: null,
    dueDate: null,
    completedAt: null,
    status: 'pending',
    priority: 'medium',
    durationMinutes: null,
    assignedToId: null,
    createdById: null,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'a3',
    activityType: 'task',
    title: null,
    description: null,
    dueDate: null,
    completedAt: null,
    status: 'pending',
    priority: 'medium',
    durationMinutes: null,
    assignedToId: null,
    createdById: null,
    createdAt: '2026-01-03T00:00:00.000Z',
  },
] as unknown as ContactActivity[]

const DEALS: DealListItem[] = [
  { status: DealStatus.OPEN, valueCents: 1_000_000 } as DealListItem,
  { status: DealStatus.WON, valueCents: 2_000_000 } as DealListItem,
]

beforeEach(() => {
  push.mockClear()
  capturedOnArchived = undefined
  capturedOnMerged = undefined
})

describe('useContactDetail', () => {
  it('surfaces the record query state as-is', () => {
    const { result } = renderHook(() => useContactDetail('c-1'), { wrapper })

    expect(result.current.contact).toBe(CONTACT)
    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('builds the rail counts from the grouped activities and open deals', () => {
    const { result } = renderHook(() => useContactDetail('c-1'), { wrapper })

    const byId = new Map(result.current.rail.map((item) => [item.id, item.count]))
    expect(byId.get('notes')).toBe(1)
    expect(byId.get('tasks')).toBe(2)
    expect(byId.get('meetings')).toBeUndefined()
    expect(byId.get('deals')).toBe(1)
  })

  it('switches the active tab through tabs.select', () => {
    const { result } = renderHook(() => useContactDetail('c-1'), { wrapper })

    expect(result.current.tabs.active).toBe('details')

    act(() => result.current.tabs.select('activity'))

    expect(result.current.tabs.active).toBe('activity')
  })

  it('wires activities.onToggle to the row-action toggle handler', () => {
    const { result } = renderHook(() => useContactDetail('c-1'), { wrapper })

    expect(result.current.activities.onToggle).toBe(result.current.actions.onToggleActivity)
  })

  it('routes back to the contacts list once the archive dialog reports success', () => {
    renderHook(() => useContactDetail('c-1'), { wrapper })

    act(() => capturedOnArchived?.())

    expect(push).toHaveBeenCalledWith('/contacts')
  })

  it('routes back to the contacts list once a merge completes', () => {
    renderHook(() => useContactDetail('c-1'), { wrapper })

    act(() => capturedOnMerged?.())

    expect(push).toHaveBeenCalledWith('/contacts')
  })
})
