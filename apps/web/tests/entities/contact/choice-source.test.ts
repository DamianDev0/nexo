import { describe, expect, it } from 'vitest'

import { choiceSource, isChoiceSearchable } from '@/entities/contact/lib/choice-source'

const OPTIONS = [
  { key: 'lead', label: 'Lead' },
  { key: 'customer', label: 'Cliente Épico' },
]

describe('choiceSource', () => {
  it('keys options by their key and matches labels ignoring accents and case', () => {
    const source = choiceSource(OPTIONS, (option) => option.label)
    expect(source.getValue(OPTIONS[1]!)).toBe('customer')
    expect(source.filterFn?.(OPTIONS[1]!, 'epico')).toBe(true)
    expect(source.filterFn?.(OPTIONS[0]!, 'epico')).toBe(false)
  })
})

describe('isChoiceSearchable', () => {
  it('adds search only once the list is long enough to need it', () => {
    expect(isChoiceSearchable(OPTIONS)).toBe(false)
    expect(
      isChoiceSearchable(Array.from({ length: 8 }, (_, i) => ({ key: `${i}`, label: `${i}` }))),
    ).toBe(true)
  })
})
