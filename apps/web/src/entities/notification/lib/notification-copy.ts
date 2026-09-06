import type { Notification } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export type NotificationCopy = {
  readonly title: string
  readonly body: string
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function bulkActionCopy(t: TFunction, notification: Notification): NotificationCopy | null {
  const data = notification.data
  const action = data?.['action']
  const succeeded = asNumber(data?.['succeeded'])
  const failed = asNumber(data?.['failed'])
  if (typeof action !== 'string' || succeeded === null || failed === null) return null
  return {
    title: t('notifications.types.bulkActionCompleted.title', {
      kind: t(`contacts.bulk.actions.${action}`),
    }),
    body: t('notifications.types.bulkActionCompleted.body', {
      count: succeeded,
      succeeded,
      failed,
    }),
  }
}

function contactAssignedCopy(t: TFunction, notification: Notification): NotificationCopy | null {
  const data = notification.data
  const count = asNumber(data?.['count'])
  if (count === null) return null
  const contactName = data?.['contactName']
  return {
    title:
      count === 1 && typeof contactName === 'string'
        ? t('notifications.types.contactAssigned.titleOne', { name: contactName })
        : t('notifications.types.contactAssigned.title', { count }),
    body: t('notifications.types.contactAssigned.body'),
  }
}

const COPY_BY_TYPE: Readonly<
  Record<string, (t: TFunction, notification: Notification) => NotificationCopy | null>
> = {
  'bulk_action.completed': bulkActionCopy,
  'contact.assigned': contactAssignedCopy,
}

export function notificationCopy(t: TFunction, notification: Notification): NotificationCopy {
  const translated = COPY_BY_TYPE[notification.notificationType]?.(t, notification) ?? null
  return translated ?? { title: notification.title, body: notification.body ?? '' }
}
