import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useBulkDialog } from '@/features/bulk-actions/model/useBulkDialog'

describe('useBulkDialog', () => {
  it('opens a dialog with an optional context and closes it', () => {
    const { result } = renderHook(() => useBulkDialog())
    expect(result.current.kind).toBeNull()
    expect(result.current.context).toEqual({})

    act(() => result.current.open('remove_tags', { tags: ['vip'] }))
    expect(result.current.kind).toBe('remove_tags')
    expect(result.current.context.tags).toEqual(['vip'])

    act(() => result.current.open('status'))
    expect(result.current.context).toEqual({})

    act(() => result.current.close())
    expect(result.current.kind).toBeNull()
  })
})
