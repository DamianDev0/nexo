import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { buildContact } from '../../msw/handlers'

import type { ContactRowActions, ContactTaxonomyMaps } from '@/entities/contact'
import type { useEntityEditor } from '@/shared/lib/hooks/useEntityEditor'
import type { ContactListItem } from '@repo/shared-types'

import { useBoardPreview } from '@/widgets/contacts-board/model/useBoardPreview'

const TAXONOMY: ContactTaxonomyMaps = {
  statusByKey: new Map(),
  sourceByKey: new Map(),
  lifecycleByKey: new Map(),
}

function makeEditor(
  editing: ContactListItem | null,
  open = true,
): ReturnType<typeof useEntityEditor<ContactListItem>> {
  return { editing, open, setOpen: vi.fn(), openCreate: vi.fn(), openEdit: vi.fn() }
}

describe('useBoardPreview', () => {
  it('prefers the live sibling row over the frozen editor snapshot', () => {
    const stale = buildContact({ id: 'c-1', firstName: 'Stale' })
    const fresh = buildContact({ id: 'c-1', firstName: 'Fresh' })
    const editor = makeEditor(stale)

    const { result } = renderHook(() =>
      useBoardPreview({
        editor,
        rowActions: {},
        openFromPreview: vi.fn(),
        siblings: [fresh],
        taxonomy: TAXONOMY,
      }),
    )

    expect(result.current.contact?.firstName).toBe('Fresh')
  })

  it('falls back to the editor snapshot when the row left the sibling list', () => {
    const gone = buildContact({ id: 'c-9', firstName: 'Gone' })
    const editor = makeEditor(gone)

    const { result } = renderHook(() =>
      useBoardPreview({
        editor,
        rowActions: {},
        openFromPreview: vi.fn(),
        siblings: [buildContact({ id: 'c-1' })],
        taxonomy: TAXONOMY,
      }),
    )

    expect(result.current.contact).toBe(gone)
  })

  it('routes selecting a record through openFromPreview instead of the raw row action', () => {
    const onOpen = vi.fn()
    const openFromPreview = vi.fn()
    const editor = makeEditor(buildContact({ id: 'c-1' }))
    const contact = buildContact({ id: 'c-1' })

    const { result } = renderHook(() =>
      useBoardPreview({
        editor,
        rowActions: { onOpen } as ContactRowActions,
        openFromPreview,
        siblings: [contact],
        taxonomy: TAXONOMY,
      }),
    )

    act(() => result.current.actions.onOpen?.(contact))

    expect(openFromPreview).toHaveBeenCalledWith(contact)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('wires onSelect to the editor openEdit handler', () => {
    const editor = makeEditor(buildContact({ id: 'c-1' }))

    const { result } = renderHook(() =>
      useBoardPreview({
        editor,
        rowActions: {},
        openFromPreview: vi.fn(),
        siblings: [],
        taxonomy: TAXONOMY,
      }),
    )

    expect(result.current.onSelect).toBe(editor.openEdit)
    expect(result.current.onOpenChange).toBe(editor.setOpen)
    expect(result.current.open).toBe(editor.open)
  })
})
