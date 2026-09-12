import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import {
  buildMeetingPayload,
  buildMeetingSchema,
  meetingDefaults,
} from '@/features/schedule-meeting/lib/meeting-form.schema'

const t = ((key: string) => key) as TFunction
const CONTACT_ID = 'c1'

function values(overrides = {}) {
  return { ...meetingDefaults(new Date('2026-09-15T12:00:00.000Z')), ...overrides }
}

describe('buildMeetingPayload', () => {
  it('files the meeting as an activity against the contact', () => {
    const payload = buildMeetingPayload(CONTACT_ID, values({ title: 'Visita técnica' }))

    expect(payload.activityType).toBe('meeting')
    expect(payload.contactId).toBe(CONTACT_ID)
    expect(payload.title).toBe('Visita técnica')
  })

  it('turns the start and end into a due date and a duration', () => {
    const payload = buildMeetingPayload(
      CONTACT_ID,
      values({ date: '2026-09-15', startTime: '09:00', endTime: '10:30' }),
    )

    expect(payload.dueDate).toBe('2026-09-15T14:00:00.000Z')
    expect(payload.durationMinutes).toBe(90)
  })

  it('leaves the reminder out unless one was chosen', () => {
    expect(buildMeetingPayload(CONTACT_ID, values()).reminderAt).toBeUndefined()
    expect(buildMeetingPayload(CONTACT_ID, values({ reminderMinutes: 30 })).reminderAt).toBe(
      '2026-09-15T13:30:00.000Z',
    )
  })

  it('sends an owner only when one was picked', () => {
    expect(buildMeetingPayload(CONTACT_ID, values()).assignedToId).toBeUndefined()
    expect(buildMeetingPayload(CONTACT_ID, values({ assignedToId: 'u1' })).assignedToId).toBe('u1')
  })

  it('sends no description rather than an empty one', () => {
    expect(buildMeetingPayload(CONTACT_ID, values()).description).toBeUndefined()
    expect(
      buildMeetingPayload(CONTACT_ID, values({ description: 'Llevar planos' })).description,
    ).toBe('Llevar planos')
  })
})

describe('buildMeetingSchema', () => {
  it('accepts the defaults once a subject is written', () => {
    const parsed = buildMeetingSchema(t).safeParse(values({ title: 'Reunión' }))

    expect(parsed.success).toBe(true)
  })

  it('refuses a meeting with no subject', () => {
    expect(buildMeetingSchema(t).safeParse(values()).success).toBe(false)
  })

  it('refuses a malformed clock', () => {
    const parsed = buildMeetingSchema(t).safeParse(values({ title: 'X', startTime: '25:00' }))

    expect(parsed.success).toBe(false)
  })
})
