import { describe, expect, it } from 'vitest'

import type { Notification } from '@repo/shared-types'

import {
  notificationTimeAgo,
  toNotificationFeed,
} from '@/entities/notification/lib/notification-feed'

const NOW = new Date('2026-08-14T12:00:00.000Z')

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    userId: 'u1',
    notificationType: 'contact.created' as Notification['notificationType'],
    title: 'Nuevo contacto',
    body: 'Maria Lopez fue creada',
    entityType: 'contact',
    entityId: 'c1',
    isRead: false,
    readAt: null,
    createdAt: '2026-08-14T11:30:00.000Z',
    ...overrides,
  }
}

describe('notificationTimeAgo', () => {
  it('reports minutes for anything under an hour', () => {
    expect(notificationTimeAgo('2026-08-14T11:30:00.000Z', 'en', NOW)).toContain('30')
  })

  it('never reports zero minutes for a just-created notification', () => {
    expect(notificationTimeAgo('2026-08-14T11:59:59.000Z', 'en', NOW)).toContain('1')
  })

  it('reports hours between one hour and one day', () => {
    expect(notificationTimeAgo('2026-08-14T07:00:00.000Z', 'en', NOW)).toContain('5')
  })

  it('reports days past twenty-four hours', () => {
    expect(notificationTimeAgo('2026-08-11T12:00:00.000Z', 'en', NOW)).toContain('3')
  })

  it('clamps future timestamps to the most recent bucket', () => {
    expect(notificationTimeAgo('2026-08-14T13:00:00.000Z', 'en', NOW)).toContain('1')
  })
})

describe('toNotificationFeed', () => {
  it('maps a notification into a feed item', () => {
    expect(toNotificationFeed([notification()], 'en', NOW)).toEqual([
      expect.objectContaining({
        id: 'n1',
        title: 'Nuevo contacto',
        body: 'Maria Lopez fue creada',
        unread: true,
      }),
    ])
  })

  it('replaces a null body with an empty string', () => {
    expect(toNotificationFeed([notification({ body: null })], 'en', NOW)).toEqual([
      expect.objectContaining({ body: '' }),
    ])
  })

  it('marks read notifications as not unread', () => {
    expect(toNotificationFeed([notification({ isRead: true })], 'en', NOW)).toEqual([
      expect.objectContaining({ unread: false }),
    ])
  })

  it('returns an empty feed for an empty list', () => {
    expect(toNotificationFeed([], 'en', NOW)).toEqual([])
  })
})
