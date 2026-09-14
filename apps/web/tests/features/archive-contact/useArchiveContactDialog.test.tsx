import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactListItem } from '@repo/shared-types'

import { useArchiveContactDialog } from '@/features/archive-contact'

const archive = vi.fn()

vi.mock('@/shared/api/services/contacts.service', () => ({
  default: { archive: (id: string) => archive(id) },
}))

const CONTACT = { id: 'c1', firstName: 'Carolina' } as ContactListItem

describe('useArchiveContactDialog', () => {
  it('opens closed, with nothing to confirm', () => {
    const { result } = renderHook(() => useArchiveContactDialog(), { wrapper })

    expect(result.current.target).toBeNull()
  })

  it('remembers which contact the user asked about', () => {
    const { result } = renderHook(() => useArchiveContactDialog(), { wrapper })

    act(() => result.current.ask(CONTACT))

    expect(result.current.target).toBe(CONTACT)
  })

  it('archives the contact it was asked about and closes', async () => {
    archive.mockResolvedValueOnce(undefined)
    const onArchived = vi.fn()
    const { result } = renderHook(() => useArchiveContactDialog(onArchived), { wrapper })

    act(() => result.current.ask(CONTACT))
    act(() => result.current.confirm())

    expect(result.current.target).toBeNull()
    await waitFor(() => expect(archive).toHaveBeenCalledWith('c1'))
    await waitFor(() => expect(onArchived).toHaveBeenCalledOnce())
  })

  it('archives nothing when the user backs out', async () => {
    archive.mockClear()
    const { result } = renderHook(() => useArchiveContactDialog(), { wrapper })

    act(() => result.current.ask(CONTACT))
    act(() => result.current.close())
    act(() => result.current.confirm())

    expect(result.current.target).toBeNull()
    await waitFor(() => expect(archive).not.toHaveBeenCalled())
  })
})
