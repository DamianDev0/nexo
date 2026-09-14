import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactListItem } from '@repo/shared-types'

import { useMergeContactsDialog } from '@/features/merge-contacts'

const merge = vi.fn()

vi.mock('@/shared/api/services/contacts.service', () => ({
  default: { merge: (winnerId: string, data: unknown) => merge(winnerId, data) },
}))

function contact(overrides: Partial<ContactListItem>): ContactListItem {
  return {
    id: 'c1',
    firstName: 'Carolina',
    lastName: null,
    email: 'carolina@acme.co',
    phone: '3001234567',
    whatsapp: null,
    city: null,
    tags: [],
    ...overrides,
  } as ContactListItem
}

const WINNER = contact({})
const LOSER = contact({ id: 'c2', email: 'caro@gmail.com', whatsapp: '3009998877' })

describe('useMergeContactsDialog', () => {
  it('starts closed with no duplicate picked', () => {
    const { result } = renderHook(() => useMergeContactsDialog(WINNER), { wrapper })

    expect(result.current.open).toBe(false)
    expect(result.current.loser).toBeNull()
    expect(result.current.rows).toEqual([])
  })

  it('pre-picks the duplicate only where the survivor has a gap', () => {
    const { result } = renderHook(() => useMergeContactsDialog(WINNER), { wrapper })

    act(() => result.current.ask())
    act(() => result.current.pickLoser(LOSER))

    expect(result.current.open).toBe(true)
    expect(result.current.fields).toContain('whatsapp')
    expect(result.current.fields).not.toContain('email')
  })

  it('lets the user take a field from the duplicate and give it back', () => {
    const { result } = renderHook(() => useMergeContactsDialog(WINNER), { wrapper })

    act(() => result.current.pickLoser(LOSER))
    act(() => result.current.toggleField('email'))
    expect(result.current.fields).toContain('email')

    act(() => result.current.toggleField('email'))
    expect(result.current.fields).not.toContain('email')
  })

  it('sends the survivor, the duplicate and the chosen fields', async () => {
    merge.mockResolvedValueOnce({ contact: WINNER, movedRecords: 4 })
    const { result } = renderHook(() => useMergeContactsDialog(WINNER), { wrapper })

    act(() => result.current.pickLoser(LOSER))
    act(() => result.current.confirm())

    await waitFor(() =>
      expect(merge).toHaveBeenCalledWith('c1', {
        loserId: 'c2',
        fieldsFromLoser: ['whatsapp'],
      }),
    )
  })

  it('merges nothing until a duplicate is picked', () => {
    merge.mockClear()
    const { result } = renderHook(() => useMergeContactsDialog(WINNER), { wrapper })

    act(() => result.current.confirm())

    expect(merge).not.toHaveBeenCalled()
  })

  it('forgets the duplicate when the dialog closes', () => {
    const { result } = renderHook(() => useMergeContactsDialog(WINNER), { wrapper })

    act(() => result.current.pickLoser(LOSER))
    act(() => result.current.close())

    expect(result.current.open).toBe(false)
    expect(result.current.loser).toBeNull()
    expect(result.current.fields).toEqual([])
  })
})
