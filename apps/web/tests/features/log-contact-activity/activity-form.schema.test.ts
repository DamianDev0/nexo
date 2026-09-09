import { describe, expect, it } from 'vitest'

import {
  ACTIVITY_DEFAULT_TIME,
  ACTIVITY_TITLE_MAX,
} from '@/features/log-contact-activity/config/activity.constants'
import {
  activityDefaults,
  bogotaToday,
  buildActivityPayload,
  buildActivitySchema,
  toBogotaIso,
} from '@/features/log-contact-activity/lib/activity-form.schema'

const t = ((key: string) => key) as never

describe('buildActivitySchema', () => {
  const schema = buildActivitySchema(t)
  const valid = {
    title: 'Enviar cotización',
    dueDate: '2026-09-10',
    time: '14:30',
    priority: 'normal',
    description: '',
  }

  it('rejects an unknown priority', () => {
    expect(schema.safeParse({ ...valid, priority: 'urgent' }).success).toBe(false)
  })

  it('accepts a complete activity and trims the title', () => {
    const result = schema.safeParse({ ...valid, title: '  Llamar  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.title).toBe('Llamar')
  })

  it('rejects an empty title', () => {
    expect(schema.safeParse({ ...valid, title: '  ' }).success).toBe(false)
  })

  it('rejects titles over the limit', () => {
    expect(schema.safeParse({ ...valid, title: 'x'.repeat(ACTIVITY_TITLE_MAX + 1) }).success).toBe(
      false,
    )
  })

  it('rejects a malformed date or time', () => {
    expect(schema.safeParse({ ...valid, dueDate: '10/09/2026' }).success).toBe(false)
    expect(schema.safeParse({ ...valid, time: '25:00' }).success).toBe(false)
  })
})

describe('bogotaToday', () => {
  it('uses the Bogotá calendar day even when UTC already rolled over', () => {
    expect(bogotaToday(new Date('2026-09-11T03:30:00.000Z'))).toBe('2026-09-10')
    expect(bogotaToday(new Date('2026-09-11T05:00:00.000Z'))).toBe('2026-09-11')
  })
})

describe('activityDefaults', () => {
  it('starts on today at the default time', () => {
    expect(activityDefaults(new Date('2026-09-06T12:00:00.000Z'))).toEqual({
      title: '',
      dueDate: '2026-09-06',
      time: ACTIVITY_DEFAULT_TIME,
      priority: 'normal',
      description: '',
    })
  })
})

describe('toBogotaIso', () => {
  it('interprets the wall clock in UTC-5', () => {
    expect(toBogotaIso('2026-09-10', '14:30')).toBe('2026-09-10T19:30:00.000Z')
  })
})

describe('buildActivityPayload', () => {
  it('maps the form into a create-activity request', () => {
    const payload = buildActivityPayload('meeting', 'c1', {
      title: 'Visita',
      dueDate: '2026-09-10',
      time: '09:00',
      priority: 'normal',
      description: 'Llevar muestras',
    })
    expect(payload).toEqual({
      activityType: 'meeting',
      contactId: 'c1',
      title: 'Visita',
      description: 'Llevar muestras',
      dueDate: '2026-09-10T14:00:00.000Z',
    })
  })

  it('omits an empty description and carries the task priority', () => {
    const payload = buildActivityPayload('task', 'c1', {
      title: 'Cotizar',
      dueDate: '2026-09-10',
      time: '09:00',
      priority: 'high',
      description: '',
    })
    expect(payload.description).toBeUndefined()
    expect(payload.priority).toBe('high')
  })

  it('does not send a priority for meetings', () => {
    const payload = buildActivityPayload('meeting', 'c1', {
      title: 'Visita',
      dueDate: '2026-09-10',
      time: '09:00',
      priority: 'high',
      description: '',
    })
    expect(payload.priority).toBeUndefined()
  })
})
