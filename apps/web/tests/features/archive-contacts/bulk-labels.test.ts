import { describe, expect, it, vi } from 'vitest'

import type { TFunction } from 'i18next'

import { buildBulkLabels } from '@/features/archive-contacts/lib/bulk-labels'

const t = vi.fn(
  (key: string, options?: { count?: number }) => `${key}:${options?.count ?? ''}`,
) as unknown as TFunction

describe('buildBulkLabels', () => {
  it('interpolates the selected count', () => {
    expect(buildBulkLabels(t).selected(25)).toBe('common.table.selection.selected:25')
  })

  it('interpolates the total into the select-all label', () => {
    expect(buildBulkLabels(t).selectAll(3587)).toBe('common.table.selection.selectAll:3587')
  })

  it('resolves the clear label eagerly', () => {
    expect(buildBulkLabels(t).clear).toBe('common.table.selection.clear:')
  })
})
