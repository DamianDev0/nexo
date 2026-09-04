import { DocumentType } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import {
  contactMailHref,
  contactPhoneLabel,
  contactScoreBand,
  contactDialNumber,
  contactTelHref,
  contactWaHref,
  daysSince,
  isValidContactDocument,
  sameCOPhone,
} from '@/entities/contact/lib/contact-links'

describe('contactTelHref', () => {
  it('builds a tel link with country code', () => {
    expect(contactTelHref('300 123 4567')).toBe('tel:+573001234567')
  })

  it('strips an existing country code', () => {
    expect(contactTelHref('+57 300 123 4567')).toBe('tel:+573001234567')
  })
})

describe('contactDialNumber', () => {
  it('normalizes to e164 for the dialer', () => {
    expect(contactDialNumber('300 123 4567')).toBe('+573001234567')
  })
})

describe('contactWaHref', () => {
  it('builds a wa.me link from digits', () => {
    expect(contactWaHref('310 005 0717')).toBe('https://wa.me/573100050717')
  })
})

describe('contactMailHref', () => {
  it('builds a mailto link', () => {
    expect(contactMailHref('ana@empresa.co')).toBe('mailto:ana@empresa.co')
  })
})

describe('contactPhoneLabel', () => {
  it('formats with country code and spaced groups', () => {
    expect(contactPhoneLabel('3001234567')).toBe('+57 300 123 4567')
  })
})

describe('contactScoreBand', () => {
  it('maps score ranges to bands', () => {
    expect(contactScoreBand(99)).toBe('high')
    expect(contactScoreBand(70)).toBe('high')
    expect(contactScoreBand(69)).toBe('medium')
    expect(contactScoreBand(40)).toBe('medium')
    expect(contactScoreBand(39)).toBe('low')
    expect(contactScoreBand(1)).toBe('low')
  })
})

describe('daysSince', () => {
  it('counts full elapsed days', () => {
    const twoDaysAgo = new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString()
    expect(daysSince(twoDaysAgo)).toBe(2)
  })

  it('returns zero for recent timestamps', () => {
    expect(daysSince(new Date().toISOString())).toBe(0)
  })
})

describe('sameCOPhone', () => {
  it('ignores formatting and country code', () => {
    expect(sameCOPhone('+57 300 123 4567', '3001234567')).toBe(true)
    expect(sameCOPhone('3001234567', '3109998877')).toBe(false)
  })
})

describe('isValidContactDocument', () => {
  it('accepts contacts without a document type', () => {
    expect(isValidContactDocument(null, '123')).toBe(true)
  })

  it('validates against the document type rules', () => {
    expect(isValidContactDocument(DocumentType.CC, '1000324679')).toBe(true)
    expect(isValidContactDocument(DocumentType.CC, 'ABC')).toBe(false)
  })

  it('normalizes legacy uppercase types and skips unknown ones', () => {
    expect(isValidContactDocument('CC', '1000324679')).toBe(true)
    expect(isValidContactDocument('XX', 'anything')).toBe(true)
  })
})
