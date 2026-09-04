import { describe, expect, it, vi } from 'vitest'

import { callAction, copyAction } from '@/entities/contact/lib/comm-action-items'
import { contactDialNumber, contactTelHref } from '@/entities/contact/lib/contact-links'

describe('copyAction', () => {
  it('copies the value through the onCopy handler', () => {
    const onCopy = vi.fn()

    const item = copyAction('Copiar', '300 111 2233', { onCopy })
    item.onClick?.()

    expect(item.id).toBe('copy')
    expect(item.label).toBe('Copiar')
    expect(onCopy).toHaveBeenCalledWith('300 111 2233')
  })

  it('stays inert without actions', () => {
    expect(() => copyAction('Copiar', '300 111 2233').onClick?.()).not.toThrow()
  })
})

describe('callAction', () => {
  it('dials through the onCall handler when provided', () => {
    const onCall = vi.fn()

    const item = callAction('+57 300 111 2233', 'Llamar', onCall)
    item.onClick?.()

    expect(item.id).toBe('call')
    expect(item.href).toBeUndefined()
    expect(onCall).toHaveBeenCalledWith(contactDialNumber('+57 300 111 2233'))
  })

  it('falls back to a tel link without a handler', () => {
    const item = callAction('+57 300 111 2233', 'Llamar')

    expect(item.onClick).toBeUndefined()
    expect(item.href).toBe(contactTelHref('+57 300 111 2233'))
  })
})
