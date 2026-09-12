import { describe, expect, it, vi } from 'vitest'

import type { ContactActivity } from '@repo/shared-types'
import type { TFunction } from 'i18next'

import {
  activityDue,
  CLAMPED_LENGTH,
  isExpandableText,
} from '@/features/preview-contact/lib/activity-card'

function activity(overrides: Partial<ContactActivity>): ContactActivity {
  return {
    id: 'a1',
    activityType: 'task',
    title: null,
    description: null,
    dueDate: null,
    completedAt: null,
    status: 'pending',
    priority: 'normal',
    durationMinutes: null,
    assignedToId: null,
    createdById: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

const t = ((key: string, options?: Record<string, unknown>) =>
  `${key}:${String(options?.when ?? '')}`) as unknown as TFunction

describe('isExpandableText', () => {
  it('stays collapsed for missing or short text', () => {
    expect(isExpandableText(null)).toBe(false)
    expect(isExpandableText(undefined)).toBe(false)
    expect(isExpandableText('x'.repeat(CLAMPED_LENGTH))).toBe(false)
  })

  it('offers the disclosure once the text passes the clamp', () => {
    expect(isExpandableText('x'.repeat(CLAMPED_LENGTH + 1))).toBe(true)
  })
})

describe('activityDue', () => {
  it('says nothing when there is no due date', () => {
    expect(activityDue(t, activity({}))).toBeNull()
  })

  it('says nothing once the activity is completed', () => {
    const completed = activity({
      dueDate: '2026-09-10T15:00:00.000Z',
      completedAt: '2026-09-09T15:00:00.000Z',
      status: 'completed',
    })
    expect(activityDue(t, completed)).toBeNull()
  })

  it('labels a future due date without alarming the user', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-09-12T12:00:00.000Z'))
    const due = activityDue(t, activity({ dueDate: '2026-09-20T15:00:00.000Z' }))
    vi.useRealTimers()

    expect(due).toEqual({ overdue: false, label: 'contacts.preview.due:20/09/2026' })
  })

  it('flags a past due date as overdue', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-09-12T12:00:00.000Z'))
    const due = activityDue(t, activity({ dueDate: '2026-09-01T15:00:00.000Z' }))
    vi.useRealTimers()

    expect(due).toEqual({ overdue: true, label: 'contacts.preview.tasks.overdue:01/09/2026' })
  })
})
