import { describe, expect, it } from 'vitest'

import type { ContactActivity } from '@repo/shared-types'

import { groupContactActivities } from '@/features/preview-contact/lib/activity-groups'

function activity(overrides: Partial<ContactActivity>): ContactActivity {
  return {
    id: 'a1',
    activityType: 'note',
    title: null,
    description: null,
    dueDate: null,
    completedAt: null,
    status: 'pending',
    priority: 'normal',
    assignedToId: null,
    createdById: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

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
