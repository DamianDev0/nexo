import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import {
  bulkActionLabel,
  bulkKindLabel,
  bulkOutcomeToast,
  bulkProgressPercent,
  bulkStatusLabel,
  isBulkActionActive,
  isBulkActionRevertible,
} from '@/entities/bulk-action/lib/bulk-action-labels'

const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as unknown as TFunction

describe('isBulkActionActive', () => {
  it('treats queued, running and paused as still in flight', () => {
    expect(isBulkActionActive('queued')).toBe(true)
    expect(isBulkActionActive('running')).toBe(true)
    expect(isBulkActionActive('paused')).toBe(true)
    expect(isBulkActionActive('completed')).toBe(false)
    expect(isBulkActionActive('cancelled')).toBe(false)
  })
})

describe('bulkProgressPercent', () => {
  it('rounds and caps the ratio, and reads an empty action as done', () => {
    expect(bulkProgressPercent({ processed: 1, total: 3 })).toBe(33)
    expect(bulkProgressPercent({ processed: 5, total: 3 })).toBe(100)
    expect(bulkProgressPercent({ processed: 0, total: 0 })).toBe(100)
  })
})

describe('labels', () => {
  it('resolves status and kind through the contacts.bulk namespace', () => {
    expect(bulkStatusLabel(t, 'running')).toBe('contacts.bulk.status.running')
    expect(bulkKindLabel(t, 'add_tags')).toBe('contacts.bulk.actions.add_tags')
  })

  it('names a status update after the field it touched and falls back to the kind', () => {
    expect(bulkActionLabel(t, { action: 'update_field', params: { field: 'status' } })).toBe(
      'contacts.bulk.changeStatus',
    )
    expect(bulkActionLabel(t, { action: 'update_field', params: { field: 'custom:eps' } })).toBe(
      'contacts.bulk.actions.update_field',
    )
    expect(bulkActionLabel(t, { action: 'archive', params: {} })).toBe(
      'contacts.bulk.actions.archive',
    )
  })
})

describe('bulkOutcomeToast', () => {
  it('celebrates a clean completion and flags partial or failed runs', () => {
    expect(
      bulkOutcomeToast(t, {
        status: 'completed',
        succeeded: 4,
        failed: 0,
        action: 'archive',
        params: {},
      }),
    ).toEqual({
      tone: 'success',
      title:
        'contacts.bulk.toasts.completed:{"kind":"contacts.bulk.actions.archive","succeeded":4}',
    })
    expect(
      bulkOutcomeToast(t, {
        status: 'completed_with_errors',
        succeeded: 3,
        failed: 1,
        action: 'add_tags',
        params: {},
      }).tone,
    ).toBe('error')
    expect(
      bulkOutcomeToast(t, {
        status: 'failed',
        succeeded: 0,
        failed: 0,
        action: 'export',
        params: {},
      }).title,
    ).toBe('contacts.bulk.toasts.failed:{"kind":"contacts.bulk.actions.export"}')
    expect(
      bulkOutcomeToast(t, {
        status: 'cancelled',
        succeeded: 0,
        failed: 0,
        action: 'export',
        params: {},
      }).title,
    ).toContain('cancelled')
  })
})

describe('isBulkActionRevertible', () => {
  it('only offers undo for finished mutations that were not reverted yet', () => {
    expect(
      isBulkActionRevertible({ action: 'archive', status: 'completed', revertedAt: null }),
    ).toBe(true)
    expect(
      isBulkActionRevertible({
        action: 'add_tags',
        status: 'completed_with_errors',
        revertedAt: null,
      }),
    ).toBe(true)
    expect(
      isBulkActionRevertible({ action: 'export', status: 'completed', revertedAt: null }),
    ).toBe(false)
    expect(isBulkActionRevertible({ action: 'archive', status: 'running', revertedAt: null })).toBe(
      false,
    )
    expect(
      isBulkActionRevertible({ action: 'archive', status: 'completed', revertedAt: '2026-09-05' }),
    ).toBe(false)
  })
})
