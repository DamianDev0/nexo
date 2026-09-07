import { describe, expect, it } from 'vitest'

import type { ContactActivity } from '@repo/shared-types'

import {
  activityKindKey,
  activityPreview,
  groupContactActivities,
  isActivityCompleted,
} from '@/features/preview-contact/lib/activity-groups'

function activity(overrides: Partial<ContactActivity>): ContactActivity {
  return {
    id: 'a1',
    activityType: 'note',
    title: null,
    description: null,
    dueDate: null,
    completedAt: null,
    assignedToId: null,
    createdById: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('activityKindKey', () => {
  it('normalises known kinds and buckets the rest as other', () => {
    expect(activityKindKey('Meeting')).toBe('meeting')
    expect(activityKindKey('site_visit')).toBe('other')
  })
})

describe('groupContactActivities', () => {
  it('splits notes, tasks and meetings while keeping the full list', () => {
    const items = [
      activity({ id: 'n', activityType: 'note' }),
      activity({ id: 't', activityType: 'task' }),
      activity({ id: 'm', activityType: 'meeting' }),
      activity({ id: 'c', activityType: 'call' }),
    ]
    const groups = groupContactActivities(items)
    expect(groups.all).toHaveLength(4)
    expect(groups.notes.map((item) => item.id)).toEqual(['n'])
    expect(groups.tasks.map((item) => item.id)).toEqual(['t'])
    expect(groups.meetings.map((item) => item.id)).toEqual(['m'])
  })
})

describe('activityPreview', () => {
  it('prefers the title, then the first description line', () => {
    expect(activityPreview(activity({ title: 'Llamar', description: 'x' }))).toBe('Llamar')
    expect(activityPreview(activity({ description: 'línea 1\nlínea 2' }))).toBe('línea 1')
    expect(activityPreview(activity({}))).toBe('')
  })
})

describe('isActivityCompleted', () => {
  it('reads the completion timestamp', () => {
    expect(isActivityCompleted(activity({ completedAt: '2026-09-02T00:00:00.000Z' }))).toBe(true)
    expect(isActivityCompleted(activity({}))).toBe(false)
  })
})
