import { describe, expect, it } from 'vitest'

import { MESSAGE_BODY_MAX } from '@/features/compose-message/config/message-channels'
import {
  buildMessageSchema,
  channelHasSubject,
  messageDefaults,
} from '@/features/compose-message/lib/message-form.schema'

const t = ((key: string) => key) as never

const CONTACT = {
  id: 'cnt-1',
  email: 'ana@nexo.test',
  phone: '3001234567',
  whatsapp: '3109876543',
}

describe('buildMessageSchema', () => {
  it('validates email recipients on the email channel', () => {
    const schema = buildMessageSchema(t, 'email')
    expect(
      schema.safeParse({ to: 'no-es-email', cc: '', bcc: '', subject: '', body: 'hola' }).success,
    ).toBe(false)
    expect(
      schema.safeParse({ to: 'ana@nexo.test', cc: '', bcc: '', subject: '', body: 'hola' }).success,
    ).toBe(true)
  })

  it('validates colombian phones on sms and whatsapp', () => {
    const schema = buildMessageSchema(t, 'sms')
    expect(
      schema.safeParse({ to: '123', cc: '', bcc: '', subject: '', body: 'hola' }).success,
    ).toBe(false)
    expect(
      schema.safeParse({ to: '300 123 4567', cc: '', bcc: '', subject: '', body: 'hola' }).success,
    ).toBe(true)
  })

  it('caps the body per channel', () => {
    const sms = buildMessageSchema(t, 'sms')
    const over = 'x'.repeat(MESSAGE_BODY_MAX.sms + 1)
    expect(
      sms.safeParse({ to: '3001234567', cc: '', bcc: '', subject: '', body: over }).success,
    ).toBe(false)
  })

  it('requires a non-empty body', () => {
    const schema = buildMessageSchema(t, 'whatsapp')
    expect(
      schema.safeParse({ to: '3001234567', cc: '', bcc: '', subject: '', body: '  ' }).success,
    ).toBe(false)
  })

  it('accepts empty or comma-separated valid emails in cc and bcc', () => {
    const schema = buildMessageSchema(t, 'email')
    const base = { to: 'ana@nexo.test', subject: '', body: 'hola' }
    expect(schema.safeParse({ ...base, cc: '', bcc: '' }).success).toBe(true)
    expect(schema.safeParse({ ...base, cc: 'uno@nexo.test, dos@nexo.test', bcc: '' }).success).toBe(
      true,
    )
    expect(schema.safeParse({ ...base, cc: 'no-es-email', bcc: '' }).success).toBe(false)
    expect(schema.safeParse({ ...base, cc: '', bcc: 'uno@nexo.test,malo' }).success).toBe(false)
  })
})

describe('messageDefaults', () => {
  it('prefills the recipient per channel', () => {
    expect(messageDefaults('email', CONTACT).to).toBe('ana@nexo.test')
    expect(messageDefaults('sms', CONTACT).to).toBe('3001234567')
    expect(messageDefaults('whatsapp', CONTACT).to).toBe('3109876543')
  })

  it('falls back between phone and whatsapp', () => {
    expect(messageDefaults('sms', { ...CONTACT, phone: null }).to).toBe('3109876543')
    expect(messageDefaults('whatsapp', { ...CONTACT, whatsapp: null }).to).toBe('3001234567')
    expect(messageDefaults('email', { ...CONTACT, email: null }).to).toBe('')
  })
})

describe('channelHasSubject', () => {
  it('only email carries a subject', () => {
    expect(channelHasSubject('email')).toBe(true)
    expect(channelHasSubject('sms')).toBe(false)
    expect(channelHasSubject('whatsapp')).toBe(false)
  })
})
