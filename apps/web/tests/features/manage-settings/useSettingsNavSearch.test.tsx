import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useSettingsNavSearch } from '@/features/manage-settings/model/useSettingsNavSearch'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/entities/nomenclature', () => ({
  useModuleLabels: () => (key: string, fallback: string) => fallback,
}))

describe('useSettingsNavSearch', () => {
  it('returns every group when the query is empty', () => {
    const { result } = renderHook(() => useSettingsNavSearch())

    expect(result.current.groups.length).toBeGreaterThan(0)
  })

  it('filters groups by section label and clears back', () => {
    const { result } = renderHook(() => useSettingsNavSearch())
    const total = result.current.groups.length

    act(() => result.current.setQuery('zzz-no-match'))
    expect(result.current.groups).toHaveLength(0)

    act(() => result.current.setQuery(''))
    expect(result.current.groups).toHaveLength(total)
  })
})
