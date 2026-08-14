import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { currentUrl, resetUrl, setUrl } from '../../next-navigation-mock'

import { useCreateFromUrl } from '@/features/manage-contacts/model/useCreateFromUrl'

vi.mock('next/navigation', async () => import('../../next-navigation-mock'))

beforeEach(() => {
  resetUrl()
})

describe('useCreateFromUrl', () => {
  it('does nothing when the create param is absent', () => {
    const openCreate = vi.fn()
    setUrl('list=all')

    renderHook(() => useCreateFromUrl(openCreate))

    expect(openCreate).not.toHaveBeenCalled()
    expect(currentUrl()).toBe('list=all')
  })

  it('opens the editor when the create param is set', () => {
    const openCreate = vi.fn()
    setUrl('new=1')

    renderHook(() => useCreateFromUrl(openCreate))

    expect(openCreate).toHaveBeenCalledTimes(1)
  })

  it('strips the create param so a refresh does not reopen the editor', () => {
    setUrl('new=1')

    renderHook(() => useCreateFromUrl(vi.fn()))

    expect(currentUrl()).toBe('')
  })

  it('keeps the other query params when stripping', () => {
    setUrl('list=all&new=1&page=2')

    renderHook(() => useCreateFromUrl(vi.fn()))

    expect(new URLSearchParams(currentUrl()).get('new')).toBeNull()
    expect(new URLSearchParams(currentUrl()).get('list')).toBe('all')
    expect(new URLSearchParams(currentUrl()).get('page')).toBe('2')
  })

  it('ignores a create param that is not exactly 1', () => {
    const openCreate = vi.fn()
    setUrl('new=true')

    renderHook(() => useCreateFromUrl(openCreate))

    expect(openCreate).not.toHaveBeenCalled()
  })
})
