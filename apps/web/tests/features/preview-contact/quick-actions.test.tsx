import { describe, expect, it, vi } from 'vitest'

import { buildContact } from '../../msw/handlers'

import type { ContactRowActions } from '@/entities/contact'

import {
  buildContactQuickActions,
  contactPrimaryNumber,
} from '@/features/preview-contact/lib/quick-actions'

const t = ((key: string) => key) as never

function fullActions(): ContactRowActions {
  return {
    onOpen: vi.fn(),
    onCall: vi.fn(),
    onCompose: vi.fn(),
    onAddNote: vi.fn(),
    onEditTags: vi.fn(),
    onLogActivity: vi.fn(),
  }
}

describe('contactPrimaryNumber', () => {
  it('prefers the phone and falls back to whatsapp', () => {
    expect(contactPrimaryNumber(buildContact({ phone: '3001', whatsapp: '3002' }))).toBe('3001')
    expect(contactPrimaryNumber(buildContact({ phone: null, whatsapp: '3002' }))).toBe('3002')
    expect(contactPrimaryNumber(buildContact({ phone: null, whatsapp: null }))).toBeNull()
  })
})

describe('buildContactQuickActions', () => {
  it('exposes the seven quick actions in HubSpot order plus a primary menu', () => {
    const { items, primary } = buildContactQuickActions(t, buildContact(), fullActions())
    expect(items.map((item) => item.id)).toEqual([
      'call',
      'whatsapp',
      'email',
      'note',
      'task',
      'tag',
      'meeting',
    ])
    expect(primary.id).toBe('more')
    expect(primary.menu?.map((item) => item.id)).toContain('sms')
    expect(primary.menu?.map((item) => item.id)).toContain('edit')
  })

  it('routes each action to its handler with the contact', () => {
    const actions = fullActions()
    const contact = buildContact({ phone: '+57 300 000 0000' })
    const { items } = buildContactQuickActions(t, contact, actions)
    for (const item of items) item.onClick?.()

    expect(actions.onCall).toHaveBeenCalledWith('+573000000000')
    expect(actions.onCompose).toHaveBeenCalledWith('whatsapp', contact)
    expect(actions.onCompose).toHaveBeenCalledWith('email', contact)
    expect(actions.onAddNote).toHaveBeenCalledWith(contact)
    expect(actions.onLogActivity).toHaveBeenCalledWith('task', contact)
    expect(actions.onLogActivity).toHaveBeenCalledWith('meeting', contact)
    expect(actions.onEditTags).toHaveBeenCalledWith(contact)
  })

  it('says which field is missing when a channel cannot be reached', () => {
    const contact = buildContact({ phone: null, whatsapp: null, email: null })
    const { items } = buildContactQuickActions(t, contact, fullActions())
    const reasonFor = (id: string) => items.find((item) => item.id === id)?.reason

    expect(reasonFor('call')).toBe('contacts.completeness.field')
    expect(reasonFor('whatsapp')).toBe('contacts.completeness.field')
    expect(reasonFor('email')).toBe('contacts.completeness.field')
  })

  it('gives no reason for an action the contact can actually take', () => {
    const contact = buildContact({ phone: '3001234567', email: 'ana@nexo.co' })
    const { items } = buildContactQuickActions(t, contact, fullActions())

    for (const item of items) expect(item.reason).toBeUndefined()
  })

  it('keeps a channel the contact has no data for out of the menu', () => {
    const contact = buildContact({ phone: null, whatsapp: null, email: null })
    const { primary } = buildContactQuickActions(t, contact, fullActions())
    const ids = primary.menu?.map((item) => item.id) ?? []

    expect(ids).not.toContain('call')
    expect(ids).not.toContain('email')
    expect(ids).not.toContain('sms')
    expect(ids).toContain('note')
  })

  it('disables call without a number and drops disabled entries from the menu', () => {
    const contact = buildContact({ phone: null, whatsapp: null })
    const { items, primary } = buildContactQuickActions(t, contact, {
      ...fullActions(),
      onAddNote: undefined,
    })
    expect(items.find((item) => item.id === 'call')?.disabled).toBe(true)
    expect(items.find((item) => item.id === 'note')?.disabled).toBe(true)
    expect(primary.menu?.map((item) => item.id)).not.toContain('call')
    expect(primary.menu?.map((item) => item.id)).not.toContain('note')
  })
})
