import { describe, expect, it } from 'vitest'

import { createLocaleInstance } from '@/shared/i18n/config'

describe('i18n number interpolation', () => {
  it('groups thousands in every interpolated number, per locale', () => {
    expect(createLocaleInstance('es').t('common.table.selection.selected', { count: 50000 })).toBe(
      '50.000 seleccionados',
    )
    expect(createLocaleInstance('en').t('common.table.selection.selected', { count: 50000 })).toBe(
      '50,000 selected',
    )
  })

  it('keeps plural resolution on the raw count', () => {
    expect(createLocaleInstance('es').t('common.table.selection.selected', { count: 1 })).toBe(
      '1 seleccionado',
    )
  })
})
