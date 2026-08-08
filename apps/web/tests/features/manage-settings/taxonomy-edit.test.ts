import { taxonomyColorAt } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { TaxonomyOption } from '@repo/shared-types'

import {
  appendOption,
  patchOption,
  removeOption,
  reorderOptions,
  sameTaxonomy,
  slugifyTaxonomyKey,
} from '@/features/manage-settings/lib/taxonomy-edit'

function option(overrides: Partial<TaxonomyOption> = {}): TaxonomyOption {
  return { key: 'new', label: 'Nuevo', color: '#3B82F6', order: 1, isSystem: true, ...overrides }
}

describe('slugifyTaxonomyKey', () => {
  it('normalizes accents to snake_case', () => {
    expect(slugifyTaxonomyKey('Médico Jefe', new Set())).toBe('medico_jefe')
  })

  it('falls back to an option prefix for a digit-only label', () => {
    expect(slugifyTaxonomyKey('123', new Set())).toBe('option')
  })

  it('appends a numeric suffix on collision', () => {
    expect(slugifyTaxonomyKey('Médico Jefe', new Set(['medico_jefe']))).toBe('medico_jefe_2')
  })

  it('skips to the next suffix when the first is also taken', () => {
    const taken = new Set(['medico_jefe', 'medico_jefe_2'])
    expect(slugifyTaxonomyKey('Médico Jefe', taken)).toBe('medico_jefe_3')
  })

  it('truncates to 40 characters and still resolves collisions within that limit', () => {
    const longLabel = 'x'.repeat(45)
    const truncated = 'x'.repeat(40)
    expect(slugifyTaxonomyKey(longLabel, new Set())).toBe(truncated)

    const collided = slugifyTaxonomyKey(longLabel, new Set([truncated]))
    expect(collided).toBe(`${'x'.repeat(38)}_2`)
    expect(collided.length).toBe(40)
  })
})

describe('appendOption', () => {
  it('reindexes order for every option and puts the new one last', () => {
    const options = [option({ key: 'new', order: 1 }), option({ key: 'client', order: 2 })]

    const next = appendOption(options, 'Contactado')

    expect(next.map((o) => o.order)).toEqual([1, 2, 3])
    expect(next[2]?.label).toBe('Contactado')
  })

  it('assigns the next palette color based on the current length', () => {
    const options = [option({ key: 'new', order: 1 })]

    const next = appendOption(options, 'Contactado')

    expect(next[1]?.color).toBe(taxonomyColorAt(1))
  })

  it('generates a unique key derived from the label', () => {
    const options = [option({ key: 'contactado', order: 1 })]

    const next = appendOption(options, 'Contactado')

    expect(next[1]?.key).toBe('contactado_2')
    expect(next[1]?.isSystem).toBe(false)
  })
})

describe('patchOption', () => {
  it('patches only the matching option', () => {
    const options = [
      option({ key: 'new', label: 'Nuevo' }),
      option({ key: 'client', label: 'Cliente' }),
    ]

    const next = patchOption(options, 'client', { label: 'Cliente VIP' })

    expect(next[0]?.label).toBe('Nuevo')
    expect(next[1]?.label).toBe('Cliente VIP')
  })
})

describe('removeOption', () => {
  it('never removes a system option', () => {
    const options = [
      option({ key: 'new', isSystem: true }),
      option({ key: 'custom', isSystem: false, order: 2 }),
    ]

    const next = removeOption(options, 'new')

    expect(next.map((o) => o.key)).toEqual(['new', 'custom'])
  })

  it('removes a non-system option and reindexes order', () => {
    const options = [
      option({ key: 'new', isSystem: true, order: 1 }),
      option({ key: 'custom', isSystem: false, order: 2 }),
    ]

    const next = removeOption(options, 'custom')

    expect(next).toHaveLength(1)
    expect(next[0]).toMatchObject({ key: 'new', order: 1 })
  })
})

describe('reorderOptions', () => {
  it('moves an option to the target position and reindexes order', () => {
    const options = [
      option({ key: 'a', order: 1 }),
      option({ key: 'b', order: 2 }),
      option({ key: 'c', order: 3 }),
    ]

    const next = reorderOptions(options, 'c', 'a')

    expect(next.map((o) => o.key)).toEqual(['c', 'a', 'b'])
    expect(next.map((o) => o.order)).toEqual([1, 2, 3])
  })

  it('is a no-op when fromKey is unknown', () => {
    const options = [option({ key: 'a', order: 1 }), option({ key: 'b', order: 2 })]

    const next = reorderOptions(options, 'missing', 'a')

    expect(next).toEqual(options)
  })

  it('is a no-op when toKey is unknown', () => {
    const options = [option({ key: 'a', order: 1 }), option({ key: 'b', order: 2 })]

    const next = reorderOptions(options, 'a', 'missing')

    expect(next).toEqual(options)
  })
})

describe('sameTaxonomy', () => {
  const base = {
    statuses: [option({ key: 'new', order: 1 })],
    sources: [option({ key: 'manual', order: 1 })],
  }

  it('returns true for equal taxonomies', () => {
    expect(sameTaxonomy(base, { statuses: [...base.statuses], sources: [...base.sources] })).toBe(
      true,
    )
  })

  it('returns false when a label differs', () => {
    const other = {
      statuses: [{ ...base.statuses[0]!, label: 'Nuevo!' }],
      sources: [...base.sources],
    }
    expect(sameTaxonomy(base, other)).toBe(false)
  })

  it('returns false when an order differs', () => {
    const other = {
      statuses: [{ ...base.statuses[0]!, order: 2 }],
      sources: [...base.sources],
    }
    expect(sameTaxonomy(base, other)).toBe(false)
  })

  it('treats null and undefined as equal to each other but not to a value', () => {
    expect(sameTaxonomy(null, undefined)).toBe(false)
    expect(sameTaxonomy(null, null)).toBe(true)
    expect(sameTaxonomy(undefined, undefined)).toBe(true)
    expect(sameTaxonomy(base, null)).toBe(false)
  })
})
