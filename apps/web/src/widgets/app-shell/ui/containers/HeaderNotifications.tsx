'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  toNotificationFeed,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotifications,
} from '@/entities/notification'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { BellIcon } from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { NotificationsCarousel } from '@/shared/ui/ruixen/notifications-carousel'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

const MAX_BADGE_COUNT = 99

export function HeaderNotifications() {
  const { t, i18n } = useTranslation()
  const { data } = useUnreadNotifications()
  const { mutate: markAsRead } = useMarkNotificationRead()
  const { mutate: markAllAsRead, isPending: isClearing } = useMarkAllNotificationsRead()

  const items = useMemo(
    () => toNotificationFeed(data?.data ?? [], i18n.language),
    [data?.data, i18n.language],
  )

  const labels = useMemo(
    () => ({
      heading: t('notifications.title'),
      empty: t('notifications.empty'),
      swipeHint: t('notifications.swipeHint'),
    }),
    [t],
  )

  const unreadCount = data?.unreadCount ?? 0
  const badge = unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : `${unreadCount}`

  return (
    <Popover>
      <HintTooltip asChild hint={t('notifications.title')} side="bottom">
        <PopoverTrigger asChild>
          <HeaderIconButton aria-label={t('notifications.title')} className="relative">
            <BellIcon className="size-4" />
            {unreadCount > 0 ? (
              <span
                aria-live="polite"
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-md bg-primary px-1 text-[10px] font-semibold tabular-nums text-primary-foreground"
              >
                {badge}
              </span>
            ) : null}
          </HeaderIconButton>
        </PopoverTrigger>
      </HintTooltip>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-auto border-none bg-transparent p-0 shadow-none"
      >
        <NotificationsCarousel
          items={items}
          labels={labels}
          onSelect={markAsRead}
          onDismiss={markAsRead}
          footer={
            unreadCount > 0 ? (
              <div className="border-t border-border/60 p-1.5">
                <PillButton
                  variant="ghost"
                  size="xs"
                  disabled={isClearing}
                  onClick={() => markAllAsRead()}
                  className="w-full gap-1.5 rounded-md px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {t('notifications.markAllRead')}
                </PillButton>
              </div>
            ) : null
          }
        />
      </PopoverContent>
    </Popover>
  )
}
