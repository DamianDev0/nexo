import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'

import { commCellActions } from '@/entities/contact/lib/comm-actions'

const contact = CONTACTS_FIXTURE[0]!

describe('commCellActions', () => {
  it('passes copy and call handlers through', () => {
    const onCopy = vi.fn()
    const onCall = vi.fn()

    const result = commCellActions({ onCopy, onCall }, 'sms', contact)

    expect(result.onCopy).toBe(onCopy)
    expect(result.onCall).toBe(onCall)
    expect(result.onCompose).toBeUndefined()
  })

  it('binds compose to the channel and contact', () => {
    const onCompose = vi.fn()

    commCellActions({ onCompose }, 'whatsapp', contact).onCompose?.()

    expect(onCompose).toHaveBeenCalledWith('whatsapp', contact)
  })

  it('returns empty handlers when no actions are provided', () => {
    const result = commCellActions(undefined, 'email', contact)

    expect(result.onCopy).toBeUndefined()
    expect(result.onCall).toBeUndefined()
    expect(result.onCompose).toBeUndefined()
  })
})
