import { describe, expect, it, vi } from 'vitest'

import type { TFunction } from 'i18next'

import {
  buildBulkLabels,
  buildSelectionBannerLabels,
} from '@/features/bulk-actions/lib/bulk-labels'

const t = vi.fn(
  (key: string, options?: { count?: number }) => `${key}:${options?.count ?? ''}`,
) as unknown as TFunction

describe('buildBulkLabels', () => {
  it('interpolates the selected count', () => {
    expect(buildBulkLabels(t).selected(25)).toBe('common.table.selection.selected:25')
  })

  it('reports the override count once the whole filter is targeted', () => {
    expect(buildBulkLabels(t, 3587).selected(2)).toBe('common.table.selection.selected:3587')
  })

  it('resolves the clear label eagerly', () => {
    expect(buildBulkLabels(t).clear).toBe('common.table.selection.clear:')
  })

  it('builds the page and whole-list banner copy', () => {
    const labels = buildSelectionBannerLabels(t)
    expect(labels.pageSelected(25)).toBe('common.table.selection.pageSelected:25')
    expect(labels.allSelected(64)).toBe('common.table.selection.allSelected:64')
    expect(labels.selectAll(64)).toBe('common.table.selection.selectAll:64')
  })
})
