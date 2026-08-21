import { taxonomyColorAt } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { TaxonomyOption } from '@repo/shared-types'
import type { TFunction } from 'i18next'

import {
  appendOption,
  optionLabel,
  patchOption,
  removeOption,
  reorderOptions,
  sameTaxonomy,
  slugifyTaxonomyKey,
  taxonomyNamespace,
} from '@/features/manage-settings/lib/taxonomy-edit'

function option(overrides: Partial<TaxonomyOption> = {}): TaxonomyOption {
  return {
    key: 'new',
    label: 'Nuevo',
    description: null,
    color: '#3B82F6',
    order: 1,
    isSystem: true,
    enabled: true,
    ...overrides,
  }
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
    expect(collided).toHaveLength(40)
  })

  it('collapses a run of separators into a single underscore', () => {
    expect(slugifyTaxonomyKey('A   B---C', new Set())).toBe('a_b_c')
  })

  it('trims a trailing separator run left after stripping punctuation', () => {
    expect(slugifyTaxonomyKey('Medico!!!', new Set())).toBe('medico')
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

  it('trims the label before storing it', () => {
    const next = appendOption([], '  Contactado  ')

    expect(next[0]?.label).toBe('Contactado')
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
      option({ key: 'new', isSystem: true, enabled: true }),
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

  it('is a no-op when toKey is unknown, even among three or more options', () => {
    const options = [
      option({ key: 'a', order: 1 }),
      option({ key: 'b', order: 2 }),
      option({ key: 'c', order: 3 }),
    ]

    const next = reorderOptions(options, 'a', 'missing')

    expect(next).toEqual(options)
  })

  it('moves to a target position other than the first', () => {
    const options = [
      option({ key: 'a', order: 1 }),
      option({ key: 'b', order: 2 }),
      option({ key: 'c', order: 3 }),
    ]

    const next = reorderOptions(options, 'c', 'b')

    expect(next.map((o) => o.key)).toEqual(['a', 'c', 'b'])
  })
})

describe('taxonomyNamespace', () => {
  it('maps each taxonomy kind to its i18n namespace', () => {
    expect(taxonomyNamespace('statuses')).toBe('status')
    expect(taxonomyNamespace('sources')).toBe('source')
    expect(taxonomyNamespace('types')).toBe('types')
  })
})

describe('sameTaxonomy', () => {
  const base = {
    statuses: [option({ key: 'new', order: 1 })],
    sources: [option({ key: 'manual', order: 1 })],
    types: [option({ key: 'customer', order: 1 })],
    lifecycleStages: [option({ key: 'lead', order: 1 })],
  }

  it('returns true for equal taxonomies', () => {
    const clone = {
      statuses: [...base.statuses],
      sources: [...base.sources],
      types: [...base.types],
      lifecycleStages: [...base.lifecycleStages],
    }
    expect(sameTaxonomy(base, clone)).toBe(true)
  })

  it('returns false when a type differs', () => {
    const other = {
      statuses: [...base.statuses],
      sources: [...base.sources],
      types: [{ ...base.types[0]!, label: 'Cliente VIP' }],
      lifecycleStages: [...base.lifecycleStages],
    }
    expect(sameTaxonomy(base, other)).toBe(false)
  })

  it('returns false when a label differs', () => {
    const other = {
      statuses: [{ ...base.statuses[0]!, label: 'Nuevo!' }],
      sources: [...base.sources],
      types: [...base.types],
      lifecycleStages: [...base.lifecycleStages],
    }
    expect(sameTaxonomy(base, other)).toBe(false)
  })

  it('returns false when an order differs', () => {
    const other = {
      statuses: [{ ...base.statuses[0]!, order: 2 }],
      sources: [...base.sources],
      types: [...base.types],
      lifecycleStages: [...base.lifecycleStages],
    }
    expect(sameTaxonomy(base, other)).toBe(false)
  })

  it('returns false when a key differs', () => {
    const other = {
      statuses: [{ ...base.statuses[0]!, key: 'other' }],
      sources: [...base.sources],
      types: [...base.types],
      lifecycleStages: [...base.lifecycleStages],
    }
    expect(sameTaxonomy(base, other)).toBe(false)
  })

  it('returns false when a color differs', () => {
    const other = {
      statuses: [{ ...base.statuses[0]!, color: '#000000' }],
      sources: [...base.sources],
      types: [...base.types],
      lifecycleStages: [...base.lifecycleStages],
    }
    expect(sameTaxonomy(base, other)).toBe(false)
  })

  it('returns false when isSystem differs', () => {
    const other = {
      statuses: [{ ...base.statuses[0]!, isSystem: !base.statuses[0]!.isSystem }],
      sources: [...base.sources],
      types: [...base.types],
      lifecycleStages: [...base.lifecycleStages],
    }
    expect(sameTaxonomy(base, other)).toBe(false)
  })

  it('returns false when one taxonomy has more options than the other', () => {
    const other = {
      statuses: [...base.statuses, option({ key: 'extra', order: 2 })],
      sources: [...base.sources],
      types: [...base.types],
      lifecycleStages: [...base.lifecycleStages],
    }
    expect(sameTaxonomy(base, other)).toBe(false)
  })

  it('returns false when only one of several options differs, not just when all differ', () => {
    const multi = {
      statuses: [option({ key: 'new', order: 1 }), option({ key: 'client', order: 2 })],
      sources: [...base.sources],
      types: [...base.types],
      lifecycleStages: [...base.lifecycleStages],
    }
    const other = {
      statuses: [multi.statuses[0]!, { ...multi.statuses[1]!, label: 'Cambiado' }],
      sources: [...base.sources],
      types: [...base.types],
      lifecycleStages: [...base.lifecycleStages],
    }
    expect(sameTaxonomy(multi, other)).toBe(false)
  })

  it('treats null and undefined as equal to each other but not to a value', () => {
    expect(sameTaxonomy(null, undefined)).toBe(false)
    expect(sameTaxonomy(null, null)).toBe(true)
    expect(sameTaxonomy(undefined, undefined)).toBe(true)
    expect(sameTaxonomy(base, null)).toBe(false)
  })
})

describe('optionLabel', () => {
  const t = ((key: string, opts?: { defaultValue?: string }) =>
    key === 'contacts.status.new' ? 'Nuevo' : (opts?.defaultValue ?? key)) as unknown as TFunction

  const option = (key: string, label: string | null): TaxonomyOption => ({
    key,
    label,
    description: null,
    color: '#60A5FA',
    order: 1,
    isSystem: true,
    enabled: true,
  })

  it('prefers the stored label', () => {
    expect(optionLabel(t, 'status', option('new', 'Recien llegado'))).toBe('Recien llegado')
  })

  it('falls back to the translated system label', () => {
    expect(optionLabel(t, 'status', option('new', null))).toBe('Nuevo')
  })

  it('falls back to the raw key when no translation exists', () => {
    expect(optionLabel(t, 'status', option('dormido', null))).toBe('dormido')
  })

  it('keeps an empty stored label instead of translating', () => {
    expect(optionLabel(t, 'status', option('new', ''))).toBe('')
  })
})
