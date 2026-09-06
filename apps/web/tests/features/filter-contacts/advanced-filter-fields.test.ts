import { describe, expect, it } from 'vitest'

import type { AdvancedFieldSources } from '@/features/filter-contacts/lib/advanced-filter-fields'
import type { ContactColumnDef } from '@repo/shared-types'

import { ADVANCED_FILTER_ICONS, buildAdvancedFilterFields } from '@/features/filter-contacts'

const t = (key: string) => `t:${key}`

const column = (overrides: Partial<ContactColumnDef>): ContactColumnDef => ({
  key: 'email',
  labelKey: 'contacts.columns.email',
  hintKey: 'contacts.columnHints.email',
  sortField: null,
  defaultVisible: true,
  defaultWidth: 100,
  minWidth: 60,
  ...overrides,
})

const SOURCES: AdvancedFieldSources = {
  statuses: [{ key: 'new', label: 'Nuevo', color: '#60A5FA' }],
  sources: [{ key: 'whatsapp', label: 'WhatsApp', color: '#4ADE80' }],
  lifecycleStages: [],
  tags: ['vip'],
}

describe('buildAdvancedFilterFields', () => {
  it('maps core columns to typed fields with taxonomy options', () => {
    const fields = buildAdvancedFilterFields(
      t,
      [column({ key: 'status', labelKey: 'contacts.columns.status' })],
      SOURCES,
      ADVANCED_FILTER_ICONS,
    )
    expect(fields).toEqual([
      expect.objectContaining({
        key: 'status',
        label: 't:contacts.columns.status',
        type: 'select',
        options: [{ value: 'new', label: 'Nuevo', color: '#60A5FA' }],
      }),
    ])
  })

  it('maps the name column to the firstName filter field', () => {
    const fields = buildAdvancedFilterFields(
      t,
      [column({ key: 'name', labelKey: 'contacts.columns.name' })],
      SOURCES,
      ADVANCED_FILTER_ICONS,
    )
    expect(fields[0]?.key).toBe('name')
  })

  it('exposes tenant custom fields under the custom prefix with their options', () => {
    const fields = buildAdvancedFilterFields(
      t,
      [
        column({
          key: 'custom:segmento',
          custom: true,
          label: 'Segmento',
          fieldType: 'select',
          fieldOptions: [{ value: 'a', label: 'A' }],
        }),
      ],
      SOURCES,
      ADVANCED_FILTER_ICONS,
    )
    expect(fields).toEqual([
      expect.objectContaining({
        key: 'custom.segmento',
        label: 'Segmento',
        type: 'select',
        options: [{ value: 'a', label: 'A' }],
      }),
    ])
  })

  it('drops unknown core columns instead of guessing', () => {
    const fields = buildAdvancedFilterFields(
      t,
      [column({ key: 'actions', labelKey: 'x' })],
      SOURCES,
      ADVANCED_FILTER_ICONS,
    )
    expect(fields).toEqual([])
  })
})
