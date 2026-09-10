import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useBreadcrumbTailStore } from '@/widgets/app-shell/model/breadcrumb-tail.store'
import { useBreadcrumbTail } from '@/widgets/app-shell/model/useBreadcrumbTail'

describe('useBreadcrumbTail', () => {
  beforeEach(() => {
    useBreadcrumbTailStore.setState({ label: null })
  })

  it('publishes the label the record carries', () => {
    renderHook(() => useBreadcrumbTail('Hannah Weiss'))

    expect(useBreadcrumbTailStore.getState().label).toBe('Hannah Weiss')
  })

  it('follows the record when it changes', () => {
    const { rerender } = renderHook(({ label }) => useBreadcrumbTail(label), {
      initialProps: { label: 'Hannah Weiss' },
    })

    rerender({ label: 'Ana Guerrero' })

    expect(useBreadcrumbTailStore.getState().label).toBe('Ana Guerrero')
  })

  it('clears the crumb when the record leaves the screen', () => {
    const { unmount } = renderHook(() => useBreadcrumbTail('Hannah Weiss'))

    unmount()

    expect(useBreadcrumbTailStore.getState().label).toBeNull()
  })
})
