import { describe, expect, it } from 'vitest'

import type { ContactActivity } from '@repo/shared-types'

import {
  filterActivities,
  groupActivitiesByDay,
  relativeDayKey,
} from '@/features/preview-contact/lib/activity-timeline'

function activity(id: string, activityType: string, createdAt: string): ContactActivity {
  return {
    id,
    activityType,
    title: null,
    description: null,
    dueDate: null,
    completedAt: null,
    status: 'pending',
    priority: 'normal',
    assignedToId: null,
    createdById: null,
    createdAt,
  }
}

const ITEMS = [
  activity('a', 'call', '2026-09-08T14:00:00.000Z'),
  activity('b', 'sms', '2026-09-08T03:30:00.000Z'),
  activity('c', 'task', '2026-09-07T20:00:00.000Z'),
  activity('d', 'meeting', '2026-09-01T12:00:00.000Z'),
]

describe('filterActivities', () => {
  it('keeps everything for all and buckets kinds per filter', () => {
    expect(filterActivities(ITEMS, 'all')).toHaveLength(4)
    expect(filterActivities(ITEMS, 'calls').map((item) => item.id)).toEqual(['a'])
    expect(filterActivities(ITEMS, 'messages').map((item) => item.id)).toEqual(['b'])
    expect(filterActivities(ITEMS, 'tasks').map((item) => item.id)).toEqual(['c', 'd'])
    expect(filterActivities(ITEMS, 'notes')).toEqual([])
  })
})

describe('groupActivitiesByDay', () => {
  it('groups consecutive activities by their Bogota calendar day', () => {
    const days = groupActivitiesByDay(ITEMS)
    expect(days.map((day) => day.day)).toEqual(['2026-09-08', '2026-09-07', '2026-09-01'])
    expect(days[1]?.items.map((item) => item.id)).toEqual(['b', 'c'])
  })
})

describe('relativeDayKey', () => {
  it('labels today and yesterday relative to Bogota time', () => {
    const now = new Date('2026-09-08T12:00:00.000Z')
    expect(relativeDayKey('2026-09-08', now)).toBe('today')
    expect(relativeDayKey('2026-09-07', now)).toBe('yesterday')
    expect(relativeDayKey('2026-09-01', now)).toBeNull()
  })
})
