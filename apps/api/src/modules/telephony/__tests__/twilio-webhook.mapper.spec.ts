import { BadRequestException } from '@nestjs/common'
import {
  parseDialAction,
  parseStatusCallback,
  parseVoiceRequest,
} from '../mappers/twilio-webhook.mapper'

describe('twilio webhook mapper', () => {
  it('parses a client-originated voice request', () => {
    expect(
      parseVoiceRequest({ CallSid: 'CA1', From: 'client:tabc_udef', To: '3001234567' }),
    ).toEqual({ callSid: 'CA1', identity: 'tabc_udef', to: '3001234567' })
  })

  it('rejects voice requests that are not from a browser client', () => {
    expect(() => parseVoiceRequest({ CallSid: 'CA1', From: '+573001234567', To: '3001' })).toThrow(
      BadRequestException,
    )
    expect(() => parseVoiceRequest({ From: 'client:x', To: '3001' })).toThrow(BadRequestException)
  })

  it('parses a child-leg status callback with sequence and duration', () => {
    expect(
      parseStatusCallback({
        CallSid: 'CA2',
        ParentCallSid: 'CA1',
        CallStatus: 'completed',
        CallDuration: '42',
        SequenceNumber: '3',
      }),
    ).toEqual({
      callSid: 'CA2',
      parentCallSid: 'CA1',
      identity: null,
      twilioStatus: 'completed',
      durationSeconds: 42,
      sequence: 3,
    })
  })

  it('parses a parent-leg status callback carrying the client identity', () => {
    const parsed = parseStatusCallback({
      CallSid: 'CA1',
      From: 'client:tabc_udef',
      CallStatus: 'completed',
    })
    expect(parsed.parentCallSid).toBeNull()
    expect(parsed.identity).toBe('tabc_udef')
    expect(parsed.durationSeconds).toBe(0)
    expect(parsed.sequence).toBeNull()
  })

  it('parses a dial action', () => {
    expect(
      parseDialAction({ CallSid: 'CA1', DialCallStatus: 'no-answer', DialCallDuration: '' }),
    ).toEqual({
      callSid: 'CA1',
      twilioStatus: 'no-answer',
      durationSeconds: 0,
    })
  })
})
