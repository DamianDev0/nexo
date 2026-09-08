import { describe, expect, it } from 'vitest'

import { smsSegments } from '@/features/compose-message/lib/sms-segments'

describe('smsSegments', () => {
  it('returns zero segments for an empty body', () => {
    expect(smsSegments('')).toEqual({ encoding: 'gsm7', units: 0, segments: 0 })
  })

  it('counts plain GSM-7 text at 160 per single segment and 153 when concatenated', () => {
    expect(smsSegments('a'.repeat(160))).toMatchObject({ encoding: 'gsm7', segments: 1 })
    expect(smsSegments('a'.repeat(161))).toMatchObject({ encoding: 'gsm7', segments: 2 })
    expect(smsSegments('a'.repeat(306))).toMatchObject({ segments: 2 })
    expect(smsSegments('a'.repeat(307))).toMatchObject({ segments: 3 })
  })

  it('charges two units for GSM-7 extension characters', () => {
    expect(smsSegments('€')).toMatchObject({ encoding: 'gsm7', units: 2 })
    expect(smsSegments(`${'a'.repeat(158)}[`)).toMatchObject({ segments: 1 })
    expect(smsSegments(`${'a'.repeat(159)}[`)).toMatchObject({ segments: 2 })
  })

  it('keeps ñ, accents and ¿ inside GSM-7', () => {
    expect(smsSegments('Mañana ¿vamos? éàòùì')).toMatchObject({ encoding: 'gsm7', segments: 1 })
  })

  it('switches to UCS-2 (70 per segment) for characters outside GSM-7 such as í ó ú or emoji', () => {
    expect(smsSegments('Envío').encoding).toBe('ucs2')
    expect(smsSegments('í'.repeat(70))).toMatchObject({ encoding: 'ucs2', segments: 1 })
    expect(smsSegments('í'.repeat(71))).toMatchObject({ encoding: 'ucs2', segments: 2 })
    expect(smsSegments('hola 🙂').encoding).toBe('ucs2')
  })
})
