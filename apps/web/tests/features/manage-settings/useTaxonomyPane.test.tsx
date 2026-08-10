import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ContactTaxonomy } from '@repo/shared-types'

import { useTaxonomyPane } from '@/features/manage-settings/model/useTaxonomyPane'

const handleAdd = vi.fn()
const handlePatch = vi.fn()
const handleRemove = vi.fn()
const handleReorder = vi.fn()

const TAXONOMY: ContactTaxonomy = {
  statuses: [{ key: 'new', label: 'Nuevo', color: '#3B82F6', order: 1, isSystem: true }],
  sources: [{ key: 'manual', label: 'Manual', color: '#22C55E', order: 1, isSystem: true }],
}

let contacts = {
  taxonomy: TAXONOMY as ContactTaxonomy | null,
  isLoading: false,
  handleAdd,
  handlePatch,
  handleRemove,
  handleReorder,
}

vi.mock('@/features/manage-settings/model/settings-context', () => ({
  useManageSettings: () => ({ contacts }),
}))

beforeEach(() => {
  handleAdd.mockClear()
  handlePatch.mockClear()
  handleRemove.mockClear()
  handleReorder.mockClear()
  contacts = {
    taxonomy: TAXONOMY,
    isLoading: false,
    handleAdd,
    handlePatch,
    handleRemove,
    handleReorder,
  }
})

describe('useTaxonomyPane', () => {
  it('exposes namespace status and the statuses options for kind statuses', () => {
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    expect(result.current.namespace).toBe('status')
    expect(result.current.options).toEqual(TAXONOMY.statuses)
  })

  it('exposes namespace source and the sources options for kind sources', () => {
    const { result } = renderHook(() => useTaxonomyPane('sources'))

    expect(result.current.namespace).toBe('source')
    expect(result.current.options).toEqual(TAXONOMY.sources)
  })

  it('falls back to an empty options array when the taxonomy has not loaded', () => {
    contacts.taxonomy = null
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    expect(result.current.options).toEqual([])
  })

  it('reflects isLoading from the contacts controller', () => {
    contacts.isLoading = true
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    expect(result.current.isLoading).toBe(true)
  })

  it('starts with an empty newLabel', () => {
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    expect(result.current.newLabel).toBe('')
  })

  it('updates newLabel as the user types', () => {
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.setNewLabel('Contactado'))

    expect(result.current.newLabel).toBe('Contactado')
  })

  it('handleAdd does nothing when the trimmed label is empty', () => {
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.setNewLabel('   '))
    act(() => result.current.handleAdd())

    expect(handleAdd).not.toHaveBeenCalled()
    expect(result.current.newLabel).toBe('   ')
  })

  it('handleAdd does nothing while the taxonomy is loading', () => {
    contacts.isLoading = true
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.setNewLabel('Contactado'))
    act(() => result.current.handleAdd())

    expect(handleAdd).not.toHaveBeenCalled()
  })

  it('handleAdd calls contacts.handleAdd with the kind and trimmed label, then clears newLabel', () => {
    const { result } = renderHook(() => useTaxonomyPane('sources'))

    act(() => result.current.setNewLabel('  Ads  '))
    act(() => result.current.handleAdd())

    expect(handleAdd).toHaveBeenCalledWith('sources', 'Ads')
    expect(result.current.newLabel).toBe('')
  })

  it('actions.onPatch forwards the kind, key and patch to contacts.handlePatch', () => {
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() => result.current.actions.onPatch('new', { label: 'Nuevo!' }))

    expect(handlePatch).toHaveBeenCalledWith('statuses', 'new', { label: 'Nuevo!' })
  })

  it('actions recompute for the new kind after the pane switches tabs', () => {
    const { result, rerender } = renderHook(({ kind }) => useTaxonomyPane(kind), {
      initialProps: { kind: 'statuses' as const },
    })

    rerender({ kind: 'sources' as const })
    act(() => result.current.actions.onPatch('manual', { label: 'Manual!' }))

    expect(handlePatch).toHaveBeenCalledWith('sources', 'manual', { label: 'Manual!' })
  })

  it('actions.onRemove forwards the kind and key to contacts.handleRemove', () => {
    const { result } = renderHook(() => useTaxonomyPane('sources'))

    act(() => result.current.actions.onRemove('manual'))

    expect(handleRemove).toHaveBeenCalledWith('sources', 'manual')
  })

  it('dnd.handleDragEnd calls contacts.handleReorder through the kind-bound callback', () => {
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() =>
      result.current.dnd.handleDragEnd({
        active: { id: 'b' },
        over: { id: 'a' },
      } as never),
    )

    expect(handleReorder).toHaveBeenCalledWith('statuses', 'b', 'a')
  })

  it('dnd.handleDragEnd does not reorder when dropped on itself', () => {
    const { result } = renderHook(() => useTaxonomyPane('statuses'))

    act(() =>
      result.current.dnd.handleDragEnd({
        active: { id: 'a' },
        over: { id: 'a' },
      } as never),
    )

    expect(handleReorder).not.toHaveBeenCalled()
  })
})
