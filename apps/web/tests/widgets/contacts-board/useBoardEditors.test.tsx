import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildContact } from '../../msw/handlers'
import { contactObjectWrapper as wrapper } from '../../object-wrapper'

import { useBoardEditors } from '@/widgets/contacts-board/model/useBoardEditors'

const push = vi.fn()
const replace = vi.fn()
let searchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
  usePathname: () => '/contacts',
  useSearchParams: () => searchParams,
}))

beforeEach(() => {
  push.mockClear()
  replace.mockClear()
  searchParams = new URLSearchParams()
})

const CONTACT = buildContact({ id: 'c-1' })

describe('useBoardEditors', () => {
  it('routes to the contact detail page when viewing a record', () => {
    const { result } = renderHook(() => useBoardEditors(), { wrapper })

    act(() => result.current.viewRecord(CONTACT))

    expect(push).toHaveBeenCalledWith('/contacts/c-1')
  })

  it('opens the sheet in edit mode when the row action fires', () => {
    const { result } = renderHook(() => useBoardEditors(), { wrapper })

    act(() => result.current.rowActions.onOpen?.(CONTACT))

    expect(result.current.sheet.open).toBe(true)
    expect(result.current.sheet.editing).toBe(CONTACT)
  })

  it('opens the preview editor independently of the sheet editor', () => {
    const { result } = renderHook(() => useBoardEditors(), { wrapper })

    act(() => result.current.rowActions.onPreview?.(CONTACT))

    expect(result.current.preview.open).toBe(true)
    expect(result.current.sheet.open).toBe(false)
  })

  it('sends archive requests from the row menu to the archive dialog', () => {
    const { result } = renderHook(() => useBoardEditors(), { wrapper })

    act(() => result.current.rowActions.onArchive?.(CONTACT))

    expect(result.current.archive.target).toBe(CONTACT)
  })

  it('auto-opens the create sheet when the URL requests it and strips the param', () => {
    searchParams = new URLSearchParams('new=1')

    const { result } = renderHook(() => useBoardEditors(), { wrapper })

    expect(result.current.sheet.open).toBe(true)
    expect(result.current.sheet.editing).toBeNull()
    expect(replace).toHaveBeenCalledWith('/contacts', { scroll: false })
  })

  it('leaves the sheet closed when the URL has no create request', () => {
    const { result } = renderHook(() => useBoardEditors(), { wrapper })

    expect(result.current.sheet.open).toBe(false)
    expect(replace).not.toHaveBeenCalled()
  })
})
