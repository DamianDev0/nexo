import { describe, expect, it } from 'vitest'

import { initialsOf } from '@/shared/lib/initials'

describe('initialsOf', () => {
  it('takes the first letter of the first and last words', () => {
    expect(initialsOf('Sarah Johnson')).toBe('SJ')
    expect(initialsOf('Mike Rodriguez Santos')).toBe('MS')
  })

  it('uses two letters of a single word and a fallback for empty names', () => {
    expect(initialsOf('Hunter')).toBe('HU')
    expect(initialsOf('   ')).toBe('?')
    expect(initialsOf('', '—')).toBe('—')
  })
})
