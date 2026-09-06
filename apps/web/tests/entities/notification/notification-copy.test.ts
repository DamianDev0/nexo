import { describe, expect, it } from 'vitest'

import type { Notification } from '@repo/shared-types'
import type { TFunction } from 'i18next'

import { notificationCopy } from '@/entities/notification/lib/notification-copy'

const t = ((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key) as unknown as TFunction

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    userId: 'u1',
    notificationType: 'bulk_action.completed' as Notification['notificationType'],
    title: 'Acción masiva add_tags terminada',
    body: '3 procesados, 0 con error',
    entityType: 'bulk_action',
    entityId: 'ba-1',
    data: { action: 'add_tags', succeeded: 3, failed: 0, total: 3 },
    isRead: false,
    readAt: null,
    createdAt: '2026-08-14T11:30:00.000Z',
    ...overrides,
  }
}

describe('notificationCopy', () => {
  it('builds localized copy for a bulk action from its data', () => {
    const copy = notificationCopy(t, notification())
    expect(copy.title).toContain('contacts.bulk.actions.add_tags')
    expect(copy.body).toContain('"failed":0')
  })

  it('names the contact when a single assignment arrives and counts otherwise', () => {
    const single = notificationCopy(
      t,
      notification({
        notificationType: 'contact.assigned' as Notification['notificationType'],
        data: { count: 1, contactName: 'Laura Jiménez', contactId: 'c1', assignedById: 'u2' },
      }),
    )
    expect(single.title).toBe(
      'notifications.types.contactAssigned.titleOne:{"name":"Laura Jiménez"}',
    )
    const many = notificationCopy(
      t,
      notification({
        notificationType: 'contact.assigned' as Notification['notificationType'],
        data: { count: 12, assignedById: 'u2' },
      }),
    )
    expect(many.title).toBe('notifications.types.contactAssigned.title:{"count":12}')
  })

  it('keeps the stored text when data is incomplete or the type is unknown', () => {
    expect(notificationCopy(t, notification({ data: { action: 'add_tags' } })).title).toBe(
      'Acción masiva add_tags terminada',
    )
    const other = notification({
      notificationType: 'deal.won' as Notification['notificationType'],
      title: 'Deal won',
      body: null,
    })
    expect(notificationCopy(t, other)).toEqual({ title: 'Deal won', body: '' })
  })
})
