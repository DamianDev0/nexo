import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { currentUrl, resetUrl, setUrl } from '../../next-navigation-mock'

import { usePanelRoute } from '@/views/contact-detail/model/usePanelRoute'

vi.mock('next/navigation', () => import('../../next-navigation-mock'))

afterEach(() => resetUrl())

describe('usePanelRoute', () => {
  it('opens the default panel on a bare url', () => {
    const { result } = renderHook(() => usePanelRoute())

    expect(result.current.panel).toBe('notes')
    expect(currentUrl()).toBe('')
  })

  it('opens the panel the url names', () => {
    setUrl('panel=meetings')
    const { result } = renderHook(() => usePanelRoute())

    expect(result.current.panel).toBe('meetings')
  })

  it('writes the panel the user docked into the url', () => {
    const { result } = renderHook(() => usePanelRoute())

    act(() => result.current.onPanelChange('tasks'))

    expect(result.current.panel).toBe('tasks')
    expect(currentUrl()).toBe('panel=tasks')
  })

  it('remembers a closed panel across a reload', () => {
    const { result } = renderHook(() => usePanelRoute())

    act(() => result.current.onPanelChange(null))

    expect(result.current.panel).toBeNull()
    expect(currentUrl()).toBe('panel=none')

    const reloaded = renderHook(() => usePanelRoute())
    expect(reloaded.result.current.panel).toBeNull()
  })

  it('follows the url when the user walks back', () => {
    setUrl('panel=tasks')
    const { result } = renderHook(() => usePanelRoute())
    expect(result.current.panel).toBe('tasks')

    act(() => setUrl('panel=meetings'))

    expect(result.current.panel).toBe('meetings')
  })
})
