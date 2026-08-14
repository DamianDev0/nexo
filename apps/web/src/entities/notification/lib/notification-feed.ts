import { DAY_MS, HOUR_MS, MINUTE_MS } from '../config/notification.constants'

import type { NotificationFeedItem } from '../model/types'
import type { Notification } from '@repo/shared-types'

const formatters = new Map<string, Intl.RelativeTimeFormat>()

function relativeFormatter(locale: string): Intl.RelativeTimeFormat {
  const cached = formatters.get(locale)
  if (cached) return cached
  const created = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'narrow' })
  formatters.set(locale, created)
  return created
}

export function notificationTimeAgo(iso: string, locale: string, now: Date = new Date()): string {
  const elapsed = Math.max(0, now.getTime() - new Date(iso).getTime())
  const format = relativeFormatter(locale)

  if (elapsed < HOUR_MS) {
    return format.format(-Math.max(1, Math.floor(elapsed / MINUTE_MS)), 'minute')
  }
  if (elapsed < DAY_MS) return format.format(-Math.floor(elapsed / HOUR_MS), 'hour')
  return format.format(-Math.floor(elapsed / DAY_MS), 'day')
}

export function toNotificationFeed(
  notifications: ReadonlyArray<Notification>,
  locale: string,
  now?: Date,
): NotificationFeedItem[] {
  const at = now ?? new Date()
  return notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body ?? '',
    time: notificationTimeAgo(notification.createdAt, locale, at),
    unread: !notification.isRead,
  }))
}
