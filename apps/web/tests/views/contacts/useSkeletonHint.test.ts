import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_SKELETON_HINT } from '@/views/contacts/config/skeleton.constants'
import { useSkeletonHint } from '@/views/contacts/model/useSkeletonHint'

const readSkeletonHint = vi.fn()

vi.mock('@/entities/contact', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/contact')>()),
  readSkeletonHint: () => readSkeletonHint(),
}))

describe('useSkeletonHint', () => {
  it('falls back to the default hint when nothing is stored', () => {
    readSkeletonHint.mockReturnValueOnce(null)

    const { result } = renderHook(() => useSkeletonHint())

    expect(result.current).toEqual(DEFAULT_SKELETON_HINT)
  })

  it('adopts the stored hint once it is read on mount', () => {
    const stored = { widths: [50, 100], rows: 3 }
    readSkeletonHint.mockReturnValueOnce(stored)

    const { result } = renderHook(() => useSkeletonHint())

    expect(result.current).toEqual(stored)
  })
})
