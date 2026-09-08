import type { FieldDef } from '@repo/shared-types'
import {
  buildHeaderSuggestions,
  inferFieldType,
  suggestFieldKey,
} from '../mappers/custom-field-inference.mapper'
import type { ColumnAnalysis } from '@/shared/imports/interfaces/import.interfaces'

function column(
  overrides: Partial<ColumnAnalysis> & Pick<ColumnAnalysis, 'csvColumn'>,
): ColumnAnalysis {
  return { suggestedField: null, sampleValues: [], fillRate: 100, ...overrides }
}

function def(key: string, label: string): FieldDef {
  return { key, label, type: 'text', required: false, unique: false, order: 1 }
}

describe('inferFieldType', () => {
  it('defaults to text when there are no samples', () => {
    expect(inferFieldType([])).toBe('text')
    expect(inferFieldType(['', '  '])).toBe('text')
  })

  it('detects booleans including Spanish values', () => {
    expect(inferFieldType(['Sí', 'no', 'SI'])).toBe('boolean')
    expect(inferFieldType(['true', 'false'])).toBe('boolean')
  })

  it('detects emails, urls and dates', () => {
    expect(inferFieldType(['a@b.co', 'c@d.com'])).toBe('email')
    expect(inferFieldType(['https://nexo.co', 'http://x.io/y'])).toBe('url')
    expect(inferFieldType(['2026-01-15', '2026-02-01'])).toBe('date')
    expect(inferFieldType(['24/08/2026', '01/12/2025'])).toBe('date')
  })

  it('detects Colombian phones and plain numbers', () => {
    expect(inferFieldType(['300 123 4567', '+57 301 555 1234'])).toBe('phone')
    expect(inferFieldType(['3001234567', '3015551234'])).toBe('phone')
    expect(inferFieldType(['1500000', '42'])).toBe('number')
    expect(inferFieldType(['10.5', '3,14'])).toBe('number')
  })

  it('falls back to text on mixed samples', () => {
    expect(inferFieldType(['42', 'hello'])).toBe('text')
  })
})

describe('suggestFieldKey', () => {
  it('slugifies headers with accents and symbols', () => {
    expect(suggestFieldKey('Número de Póliza', new Set())).toBe('numero_de_poliza')
    expect(suggestFieldKey('Fecha (vencimiento)', new Set())).toBe('fecha_vencimiento')
  })

  it('prefixes keys that do not start with a letter', () => {
    expect(suggestFieldKey('2da dirección', new Set())).toBe('campo_2da_direccion')
    expect(suggestFieldKey('***', new Set())).toBe('campo')
  })

  it('dedupes against taken keys', () => {
    expect(suggestFieldKey('Ciudad', new Set(['ciudad']))).toBe('ciudad_2')
    expect(suggestFieldKey('Ciudad', new Set(['ciudad', 'ciudad_2']))).toBe('ciudad_3')
  })
})

describe('buildHeaderSuggestions', () => {
  it('builds one suggestion per column with inferred type', () => {
    const result = buildHeaderSuggestions(
      [
        column({ csvColumn: 'Correo alterno', sampleValues: ['a@b.co'], fillRate: 80 }),
        column({ csvColumn: 'Cupo crédito', sampleValues: ['1500000'] }),
      ],
      [],
    )

    expect(result).toEqual([
      expect.objectContaining({
        column: 'Correo alterno',
        suggestedKey: 'correo_alterno',
        suggestedLabel: 'Correo alterno',
        suggestedType: 'email',
        fillRate: 80,
        existingFieldKey: null,
      }),
      expect.objectContaining({ suggestedKey: 'cupo_credito', suggestedType: 'number' }),
    ])
  })

  it('flags columns that match an existing field by key or label', () => {
    const existing = [def('nit', 'NIT'), def('sector_x', 'Sector económico')]
    const result = buildHeaderSuggestions(
      [
        column({ csvColumn: 'NIT', sampleValues: ['900123'] }),
        column({ csvColumn: 'Sector económico', sampleValues: ['retail'] }),
        column({ csvColumn: 'Nuevo campo', sampleValues: [] }),
      ],
      existing,
    )

    expect(result[0]).toEqual(
      expect.objectContaining({ existingFieldKey: 'nit', suggestedKey: 'nit_2' }),
    )
    expect(result[1]).toEqual(expect.objectContaining({ existingFieldKey: 'sector_x' }))
    expect(result[2]).toEqual(expect.objectContaining({ existingFieldKey: null }))
  })

  it('dedupes suggested keys across duplicate columns', () => {
    const result = buildHeaderSuggestions(
      [column({ csvColumn: 'Zona' }), column({ csvColumn: 'zona' })],
      [],
    )

    expect(result.map((s) => s.suggestedKey)).toEqual(['zona', 'zona_2'])
  })
})
