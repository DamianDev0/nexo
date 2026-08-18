import { describe, expect, it } from 'vitest'

import { buildCsvTemplate } from '@/features/import-contacts/lib/import-template'

describe('buildCsvTemplate', () => {
  it('ships a header row the importer can map on its own', () => {
    const [header] = buildCsvTemplate().split('\n')

    expect(header).toContain('Nombre')
    expect(header).toContain('Correo')
    expect(header).toContain('Etiquetas')
  })

  it('includes one filled example row so the format is obvious', () => {
    const [header, sample] = buildCsvTemplate().split('\n')

    expect(sample?.split(',')).toHaveLength(header?.split(',').length ?? 0)
  })
})
