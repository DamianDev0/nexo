import { describe, expect, it, vi } from 'vitest'

import type { BulkAction } from '@repo/shared-types'
import type { TFunction } from 'i18next'

import { buildCompletionToast } from '@/features/bulk-actions/lib/bulk-completion-toast'

const t = ((key: string) => key) as unknown as TFunction

function action(overrides: Partial<BulkAction>): BulkAction {
  return {
    id: 'ba-1',
    entity: 'contacts',
    action: 'add_tags',
    params: {},
    status: 'completed',
    total: 3,
    processed: 3,
    succeeded: 3,
    failed: 0,
    errors: [],
    resultFileUrl: null,
    revertedAt: null,
    revertsId: null,
    createdById: 'u1',
    createdByName: 'Ana',
    startedAt: null,
    finishedAt: null,
    createdAt: '2026-09-05T00:00:00.000Z',
    ...overrides,
  }
}

describe('buildCompletionToast', () => {
  it('offers a download button for a finished export with a file', () => {
    const onDownload = vi.fn()
    const toast = buildCompletionToast(
      t,
      action({ action: 'export', resultFileUrl: 'https://files/x.xlsx' }),
      { onUndo: vi.fn(), onDownload },
    )
    expect(toast.tone).toBe('success')
    expect(toast.button?.title).toBe('contacts.bulk.toasts.download')
    toast.button?.onClick()
    expect(onDownload).toHaveBeenCalledWith('https://files/x.xlsx')
  })

  it('offers undo for revertible completions that touched at least one row', () => {
    const onUndo = vi.fn()
    const toast = buildCompletionToast(t, action({ action: 'archive' }), {
      onUndo,
      onDownload: vi.fn(),
    })
    expect(toast.button?.title).toBe('contacts.bulk.toasts.undo')
    expect(toast.description).toBe('contacts.bulk.toasts.undoHint')
    toast.button?.onClick()
    expect(onUndo).toHaveBeenCalledWith('ba-1')
  })

  it('shows no button when nothing can be undone or downloaded', () => {
    const handlers = { onUndo: vi.fn(), onDownload: vi.fn() }
    expect(buildCompletionToast(t, action({ action: 'export' }), handlers).button).toBeUndefined()
    expect(
      buildCompletionToast(t, action({ action: 'archive', succeeded: 0, failed: 3 }), handlers)
        .button,
    ).toBeUndefined()
    expect(buildCompletionToast(t, action({ action: 'revert' }), handlers).button).toBeUndefined()
  })
})
