import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { contactObjectWrapper as wrapper } from '../../object-wrapper'

import type { ContactListItem } from '@repo/shared-types'

import { useArchiveRecordDialog } from '@/features/archive-record'

const archive = vi.fn()

vi.mock('@/shared/api/services/contacts.service', () => ({
  default: { archive: (id: string) => archive(id) },
}))

const CONTACT = { id: 'c1', firstName: 'Carolina' } as ContactListItem

describe('useArchiveRecordDialog', () => {
  it('opens closed, with nothing to confirm', () => {
    const { result } = renderHook(() => useArchiveRecordDialog<ContactListItem>(), { wrapper })

    expect(result.current.target).toBeNull()
  })

  it('remembers which contact the user asked about', () => {
    const { result } = renderHook(() => useArchiveRecordDialog<ContactListItem>(), { wrapper })

    act(() => result.current.ask(CONTACT))

    expect(result.current.target).toBe(CONTACT)
  })

  it('archives the contact it was asked about and closes', async () => {
    archive.mockResolvedValueOnce(undefined)
    const onArchived = vi.fn()
    const { result } = renderHook(() => useArchiveRecordDialog<ContactListItem>(onArchived), {
      wrapper,
    })

    act(() => result.current.ask(CONTACT))
    act(() => result.current.confirm())

    expect(result.current.target).toBeNull()
    await waitFor(() => expect(archive).toHaveBeenCalledWith('c1'))
    await waitFor(() => expect(onArchived).toHaveBeenCalledOnce())
  })

  it('archives nothing when the user backs out', async () => {
    archive.mockClear()
    const { result } = renderHook(() => useArchiveRecordDialog<ContactListItem>(), { wrapper })

    act(() => result.current.ask(CONTACT))
    act(() => result.current.close())
    act(() => result.current.confirm())

    expect(result.current.target).toBeNull()
    await waitFor(() => expect(archive).not.toHaveBeenCalled())
  })
})
