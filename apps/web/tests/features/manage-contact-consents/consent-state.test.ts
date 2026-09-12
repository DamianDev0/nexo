import { CONSENT_CHANNELS } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { ContactConsent } from '@repo/shared-types'

import {
  buildChannelConsents,
  revokedChannels,
} from '@/features/manage-contact-consents/lib/consent-state'

function consent(overrides: Partial<ContactConsent>): ContactConsent {
  return {
    id: 'c1',
    contactId: 'ct1',
    channel: 'sms',
    granted: false,
    grantedAt: null,
    revokedAt: '2026-09-12T00:00:00.000Z',
    source: null,
    reason: null,
    evidence: null,
    updatedAt: '2026-09-12T00:00:00.000Z',
    ...overrides,
  }
}

describe('buildChannelConsents', () => {
  it('offers a row for every channel the product supports', () => {
    const rows = buildChannelConsents([])

    expect(rows.map((row) => row.channel)).toEqual([...CONSENT_CHANNELS])
  })

  it('treats a channel with no record as allowed', () => {
    const row = buildChannelConsents([]).find((r) => r.channel === 'email')

    expect(row?.granted).toBe(true)
    expect(row?.recorded).toBe(false)
  })

  it('reflects a revoked channel and marks it as recorded', () => {
    const row = buildChannelConsents([consent({ channel: 'sms' })]).find((r) => r.channel === 'sms')

    expect(row?.granted).toBe(false)
    expect(row?.recorded).toBe(true)
  })

  it('carries the reason the channel was revoked', () => {
    const rows = buildChannelConsents([consent({ channel: 'call', reason: 'Pidió no llamar' })])

    expect(rows.find((r) => r.channel === 'call')?.reason).toBe('Pidió no llamar')
  })

  it('keeps a channel granted again as allowed', () => {
    const rows = buildChannelConsents([consent({ channel: 'sms', granted: true })])

    expect(rows.find((r) => r.channel === 'sms')?.granted).toBe(true)
  })
})

describe('revokedChannels', () => {
  it('names only the channels that were turned off', () => {
    const list = revokedChannels([
      consent({ channel: 'sms' }),
      consent({ channel: 'email', granted: true }),
    ])

    expect(list).toEqual(['sms'])
  })

  it('returns nothing when every channel is allowed', () => {
    expect(revokedChannels([consent({ channel: 'sms', granted: true })])).toEqual([])
  })
})
