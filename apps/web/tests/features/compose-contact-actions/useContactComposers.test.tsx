import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'

import { useContactComposers } from '@/features/compose-contact-actions'

const CONTACT = CONTACTS_FIXTURE[0]!
const OTHER = CONTACTS_FIXTURE[1] ?? CONTACT

describe('useContactComposers', () => {
  it('starts with nothing composing', () => {
    const { result } = renderHook(() => useContactComposers())

    expect(result.current.active).toBeNull()
  })

  it('opens a note for the contact it was handed', () => {
    const { result } = renderHook(() => useContactComposers())

    act(() => result.current.openNote(CONTACT))

    expect(result.current.active).toEqual({ kind: 'note', contact: CONTACT })
  })

  it('opens the tag editor', () => {
    const { result } = renderHook(() => useContactComposers())

    act(() => result.current.openTags(CONTACT))

    expect(result.current.active?.kind).toBe('tags')
  })

  it('carries the channel a message is composed on', () => {
    const { result } = renderHook(() => useContactComposers())

    act(() => result.current.openMessage('sms', CONTACT))

    expect(result.current.active).toEqual({ kind: 'sms', contact: CONTACT })
  })

  it('carries the kind of activity being logged', () => {
    const { result } = renderHook(() => useContactComposers())

    act(() => result.current.openActivity('meeting', CONTACT))

    expect(result.current.active).toEqual({ kind: 'meeting', contact: CONTACT })
  })

  it('replaces the open composer instead of stacking one on another', () => {
    const { result } = renderHook(() => useContactComposers())

    act(() => result.current.openNote(CONTACT))
    act(() => result.current.openActivity('task', OTHER))

    expect(result.current.active).toEqual({ kind: 'task', contact: OTHER })
  })

  it('closes back to nothing', () => {
    const { result } = renderHook(() => useContactComposers())

    act(() => result.current.openNote(CONTACT))
    act(() => result.current.close())

    expect(result.current.active).toBeNull()
  })
})
