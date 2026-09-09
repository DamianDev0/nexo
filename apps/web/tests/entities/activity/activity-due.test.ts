import { describe, expect, it } from 'vitest'

import { isActivityOverdue, isActivityToggleable } from '@/entities/activity'

const NOW = new Date('2026-09-08T12:00:00.000Z').getTime()

describe('isActivityOverdue', () => {
  it('is overdue only for pending activities with a due date in the past', () => {
    expect(isActivityOverdue({ dueDate: '2026-09-07T12:00:00.000Z', status: 'pending' }, NOW)).toBe(
      true,
    )
    expect(isActivityOverdue({ dueDate: '2026-09-09T12:00:00.000Z', status: 'pending' }, NOW)).toBe(
      false,
    )
    expect(
      isActivityOverdue({ dueDate: '2026-09-07T12:00:00.000Z', status: 'completed' }, NOW),
    ).toBe(false)
    expect(isActivityOverdue({ dueDate: null, status: 'pending' }, NOW)).toBe(false)
  })
})

describe('isActivityToggleable', () => {
  it('only tasks and meetings can be completed from the list', () => {
    expect(isActivityToggleable('task')).toBe(true)
    expect(isActivityToggleable('Meeting')).toBe(true)
    expect(isActivityToggleable('note')).toBe(false)
    expect(isActivityToggleable('call')).toBe(false)
  })
})
