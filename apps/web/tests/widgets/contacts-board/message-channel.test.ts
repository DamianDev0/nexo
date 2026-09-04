import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'

import type { ActiveComposer } from '@/widgets/contacts-board/model/useContactComposers'

import { resolveMessageChannel } from '@/widgets/contacts-board/lib/message-channel'

const contact = CONTACTS_FIXTURE[0]!

function composer(kind: ActiveComposer['kind']): ActiveComposer {
  return { kind, contact }
}

describe('resolveMessageChannel', () => {
  it('returns null when no composer is active', () => {
    expect(resolveMessageChannel(null)).toBeNull()
  })

  it('returns null for the note and tags composers', () => {
    expect(resolveMessageChannel(composer('note'))).toBeNull()
    expect(resolveMessageChannel(composer('tags'))).toBeNull()
  })

  it('passes message channels through', () => {
    expect(resolveMessageChannel(composer('sms'))).toBe('sms')
    expect(resolveMessageChannel(composer('whatsapp'))).toBe('whatsapp')
    expect(resolveMessageChannel(composer('email'))).toBe('email')
  })
})
