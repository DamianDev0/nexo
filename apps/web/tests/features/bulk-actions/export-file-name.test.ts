import { describe, expect, it } from 'vitest'

import { defaultExportFileName } from '@/features/bulk-actions/lib/export-file-name'

describe('defaultExportFileName', () => {
  it('names the file after the entity and the Bogotá calendar date', () => {
    expect(defaultExportFileName('contacts', new Date('2026-09-06T15:00:00Z'))).toBe(
      'contacts-export-2026-09-06',
    )
  })

  it('rolls the date back when UTC is already past midnight but Bogotá is not', () => {
    expect(defaultExportFileName('deals', new Date('2026-09-07T03:30:00Z'))).toBe(
      'deals-export-2026-09-06',
    )
  })
})
