import { describe, expect, it } from 'vitest'

import type { Notification } from '@repo/shared-types'
import type { TFunction } from 'i18next'

import {
  notificationTimeAgo,
  toNotificationFeed,
} from '@/entities/notification/lib/notification-feed'

const NOW = new Date('2026-08-14T12:00:00.000Z')
const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as unknown as TFunction

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    userId: 'u1',
    notificationType: 'contact.created' as Notification['notificationType'],
    title: 'Nuevo contacto',
    body: 'Maria Lopez fue creada',
    entityType: 'contact',
    entityId: 'c1',
    data: null,
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
    expect(toNotificationFeed([notification()], 'en', t, NOW)).toEqual([
      expect.objectContaining({
        id: 'n1',
        title: 'Nuevo contacto',
        body: 'Maria Lopez fue creada',
        unread: true,
      }),
    ])
  })

  it('replaces a null body with an empty string', () => {
    expect(toNotificationFeed([notification({ body: null })], 'en', t, NOW)).toEqual([
      expect.objectContaining({ body: '' }),
    ])
  })

  it('marks read notifications as not unread', () => {
    expect(toNotificationFeed([notification({ isRead: true })], 'en', t, NOW)).toEqual([
      expect.objectContaining({ unread: false }),
    ])
  })

  it('returns an empty feed for an empty list', () => {
    expect(toNotificationFeed([], 'en', t, NOW)).toEqual([])
  })

  it('translates bulk action notifications from their structured data', () => {
    const [item] = toNotificationFeed(
      [
        notification({
          notificationType: 'bulk_action.completed' as Notification['notificationType'],
          title: 'Acción masiva archive terminada',
          data: { action: 'archive', succeeded: 25, failed: 0, total: 25 },
        }),
      ],
      'en',
      t,
      NOW,
    )
    expect(item?.title).toBe(
      'notifications.types.bulkActionCompleted.title:{"kind":"contacts.bulk.actions.archive"}',
    )
    expect(item?.body).toContain('"succeeded":25')
  })

  it('falls back to the stored copy when a bulk notification has no data', () => {
    const [item] = toNotificationFeed(
      [
        notification({
          notificationType: 'bulk_action.completed' as Notification['notificationType'],
          title: 'Acción masiva archive terminada',
        }),
      ],
      'en',
      t,
      NOW,
    )
    expect(item?.title).toBe('Acción masiva archive terminada')
  })
})
