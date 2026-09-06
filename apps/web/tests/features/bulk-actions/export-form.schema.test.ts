import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import {
  buildExportFormSchema,
  exportFormDefaults,
  toExportParams,
} from '@/features/bulk-actions/lib/export-form.schema'

const t = ((key: string) => key) as unknown as TFunction

describe('export form schema', () => {
  it('defaults to Excel with a dated file name for the entity', () => {
    const defaults = exportFormDefaults('contacts', new Date('2026-09-06T15:00:00Z'))
    expect(defaults).toEqual({ format: 'xlsx', fileName: 'contacts-export-2026-09-06' })
    expect(buildExportFormSchema(t).safeParse(defaults).success).toBe(true)
  })

  it('rejects unknown formats and over-long names', () => {
    const schema = buildExportFormSchema(t)
    expect(schema.safeParse({ format: 'pdf', fileName: '' }).success).toBe(false)
    const long = schema.safeParse({ format: 'xlsx', fileName: 'x'.repeat(81) })
    expect(long.success).toBe(false)
    if (!long.success) {
      expect(long.error.issues[0]?.message).toBe('contacts.bulk.dialogs.export.fileNameTooLong')
    }
  })

  it('trims the file name and only sends it when present', () => {
    expect(toExportParams({ format: 'json', fileName: '  clientes  ' })).toEqual({
      format: 'json',
      fileName: 'clientes',
    })
    expect(toExportParams({ format: 'json', fileName: '   ' })).toEqual({ format: 'json' })
  })
})
