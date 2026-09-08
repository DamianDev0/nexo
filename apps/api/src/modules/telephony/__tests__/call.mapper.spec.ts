import { mapCall, mapTwilioCallStatus } from '../mappers/call.mapper'
import type { CallRow } from '../interfaces/call-row.interfaces'

const ROW: CallRow = {
  id: 'call-1',
  provider: 'twilio',
  provider_call_sid: 'CA123',
  direction: 'outbound',
  status: 'completed',
  from_number: '+17372212163',
  to_number: '+573001234567',
  contact_id: 'cnt-1',
  user_id: 'usr-1',
  started_at: '2026-09-07T10:00:00Z',
  answered_at: '2026-09-07T10:00:05Z',
  ended_at: '2026-09-07T10:04:37Z',
  duration_seconds: 272,
  created_at: '2026-09-07T10:00:00Z',
}

describe('call mapper', () => {
  it('maps a row to the shared Call shape', () => {
    expect(mapCall(ROW)).toEqual({
      id: 'call-1',
      provider: 'twilio',
      providerCallSid: 'CA123',
      direction: 'outbound',
      status: 'completed',
      fromNumber: '+17372212163',
      toNumber: '+573001234567',
      contactId: 'cnt-1',
      userId: 'usr-1',
      startedAt: '2026-09-07T10:00:00Z',
      answeredAt: '2026-09-07T10:00:05Z',
      endedAt: '2026-09-07T10:04:37Z',
      durationSeconds: 272,
      createdAt: '2026-09-07T10:00:00Z',
    })
  })

  it.each([
    ['queued', 'initiated'],
    ['ringing', 'ringing'],
    ['in-progress', 'in_progress'],
    ['answered', 'in_progress'],
    ['completed', 'completed'],
    ['busy', 'busy'],
    ['no-answer', 'no_answer'],
    ['canceled', 'canceled'],
    ['failed', 'failed'],
    ['something-new', 'failed'],
  ])('maps Twilio status %s → %s', (twilio, expected) => {
    expect(mapTwilioCallStatus(twilio)).toBe(expected)
  })
})
