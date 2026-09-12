import { describe, expect, it } from 'vitest'

import { isChannelBlocked } from '@/entities/contact/lib/contact-consent-block'

describe('isChannelBlocked', () => {
  it('blocks a channel the contact opted out of', () => {
    expect(isChannelBlocked({ optedOutChannels: ['sms'] }, 'sms')).toBe(true)
  })

  it('leaves every other channel reachable', () => {
    const contact = { optedOutChannels: ['sms'] } as const

    expect(isChannelBlocked(contact, 'email')).toBe(false)
    expect(isChannelBlocked(contact, 'call')).toBe(false)
    expect(isChannelBlocked(contact, 'whatsapp')).toBe(false)
  })

  it('reaches every channel when nothing was revoked', () => {
    expect(isChannelBlocked({ optedOutChannels: [] }, 'email')).toBe(false)
  })

  it('blocks several channels at once', () => {
    const contact = { optedOutChannels: ['sms', 'email'] } as const

    expect(isChannelBlocked(contact, 'sms')).toBe(true)
    expect(isChannelBlocked(contact, 'email')).toBe(true)
  })
})
