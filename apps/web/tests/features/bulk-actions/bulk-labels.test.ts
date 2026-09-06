import { describe, expect, it, vi } from 'vitest'

import type { TFunction } from 'i18next'

import { buildBulkLabels } from '@/features/bulk-actions/lib/bulk-labels'

const t = vi.fn(
  (key: string, options?: { count?: number }) => `${key}:${options?.count ?? ''}`,
) as unknown as TFunction

describe('buildBulkLabels', () => {
  it('interpolates the selected count', () => {
    expect(buildBulkLabels(t).selected(25)).toBe('common.table.selection.selected:25')
  })

  it('switches to the whole-filter wording once every match is targeted', () => {
    expect(buildBulkLabels(t, true).selected(3587)).toBe('contacts.bulk.allMatching:3587')
  })

  it('reports the filter total, not the page count, in whole-filter mode', () => {
    expect(buildBulkLabels(t, true, 120).selected(25)).toBe('contacts.bulk.allMatching:120')
    expect(buildBulkLabels(t, false, 120).selected(25)).toBe('common.table.selection.selected:25')
  })

  it('interpolates the total into the select-all label and resolves clear eagerly', () => {
    expect(buildBulkLabels(t).selectAll(3587)).toBe('common.table.selection.selectAll:3587')
    expect(buildBulkLabels(t).clear).toBe('common.table.selection.clear:')
  })
})
