import { ContactStatus } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import { contactsQueryString, parseListParam } from '@/features/manage-contacts/model/contact-lists'

describe('parseListParam', () => {
  it('maps a valid status param', () => {
    expect(parseListParam('qualified')).toBe(ContactStatus.QUALIFIED)
  })

  it('returns null for all, unknown values and null', () => {
    expect(parseListParam('all')).toBeNull()
    expect(parseListParam('hacker')).toBeNull()
    expect(parseListParam(null)).toBeNull()
  })
})

describe('contactsQueryString', () => {
  it('serializes list and trimmed search', () => {
    expect(contactsQueryString({ status: ContactStatus.CLIENT, search: '  ana ' })).toBe(
      '?list=client&q=ana',
    )
  })

  it('returns an empty string when nothing is filtered', () => {
    expect(contactsQueryString({ status: null, search: '   ' })).toBe('')
  })
})
