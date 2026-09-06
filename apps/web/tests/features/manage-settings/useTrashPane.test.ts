import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTrashPane } from '@/features/manage-settings/model/useTrashPane'

describe('useTrashPane', () => {
  it('starts on contacts, switches between known tabs and ignores unknown ones', () => {
    const { result } = renderHook(() => useTrashPane())

    expect(result.current.tab).toBe('contacts')
    expect(result.current.tabs).toEqual(['contacts', 'tags', 'fields'])

    act(() => result.current.onTabChange('fields'))
    expect(result.current.tab).toBe('fields')

    act(() => result.current.onTabChange('nope'))
    expect(result.current.tab).toBe('fields')
  })
})
