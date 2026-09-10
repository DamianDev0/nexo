import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'

import type { ActiveComposer } from '@/features/compose-contact-actions/model/useContactComposers'

import { resolveMessageChannel } from '@/features/compose-contact-actions/lib/message-channel'

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

describe('resolveLogKind', () => {
  it('returns the activity kind for task and meeting composers only', async () => {
    const { resolveLogKind } = await import(
      '@/features/compose-contact-actions/lib/message-channel'
    )
    const contact = { id: 'c1' } as never
    expect(resolveLogKind({ kind: 'task', contact })).toBe('task')
    expect(resolveLogKind({ kind: 'meeting', contact })).toBe('meeting')
    expect(resolveLogKind({ kind: 'note', contact })).toBeNull()
    expect(resolveLogKind({ kind: 'email', contact })).toBeNull()
    expect(resolveLogKind(null)).toBeNull()
  })
})
