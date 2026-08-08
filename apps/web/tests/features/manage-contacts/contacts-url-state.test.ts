import { describe, expect, it } from 'vitest'

import { contactsQueryString, parseListParam } from '@/features/manage-contacts/lib/contact-lists'

describe('parseListParam', () => {
  it('maps any well-formed taxonomy key', () => {
    expect(parseListParam('qualified')).toBe('qualified')
    expect(parseListParam('vip_gold')).toBe('vip_gold')
  })

  it('returns null for all, malformed values and null', () => {
    expect(parseListParam('all')).toBeNull()
    expect(parseListParam('9bad')).toBeNull()
    expect(parseListParam('Not-A-Key')).toBeNull()
    expect(parseListParam(null)).toBeNull()
  })
})

describe('contactsQueryString', () => {
  it('serializes list and trimmed search', () => {
    expect(contactsQueryString({ status: 'client', search: '  ana ' })).toBe('?list=client&q=ana')
  })

  it('returns an empty string when nothing is filtered', () => {
    expect(contactsQueryString({ status: null, search: '   ' })).toBe('')
  })
})
