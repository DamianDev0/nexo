'use client'

import { formatDateCO, timeAgo } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import {
  activityIcon,
  activityKindKey,
  activityPreview,
  isActivityCompleted,
  isActivityOverdue,
  isActivityToggleable,
} from '@/entities/activity'
import { cn } from '@/shared/lib'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import type { ContactActivity } from '@repo/shared-types'

type ToggleActivity = (activity: ContactActivity) => void

function KindMark({
  activity,
  completed,
  onToggle,
}: Readonly<{ activity: ContactActivity; completed: boolean; onToggle?: ToggleActivity }>) {
  const { t } = useTranslation()
  const kind = activityKindKey(activity.activityType)
  const mark = (
    <span
      aria-hidden
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-3.5',
        completed && 'bg-positive-surface text-positive-text',
      )}
    >
      {completed ? <CheckIcon /> : activityIcon(kind)}
    </span>
  )

  if (!onToggle || !isActivityToggleable(activity.activityType)) return mark

  return (
    <PillButton
      variant="ghost"
      size="xs"
      role="checkbox"
      aria-checked={completed}
      aria-label={t(
        completed ? 'contacts.preview.tasks.reopen' : 'contacts.preview.tasks.complete',
      )}
      onClick={() => onToggle(activity)}
      className="size-6 shrink-0 rounded-md p-0 hover:bg-accent"
    >
      {mark}
    </PillButton>
  )
}

function ActivityRow({
  activity,
  onToggle,
}: Readonly<{ activity: ContactActivity; onToggle?: ToggleActivity }>) {
  const { t, i18n } = useTranslation()
  const kind = activityKindKey(activity.activityType)
  const completed = isActivityCompleted(activity)
  const overdue = isActivityOverdue(activity)
  const preview = activityPreview(activity)

  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <span className="mt-0.5">
        <KindMark activity={activity} completed={completed} onToggle={onToggle} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <HintTooltip asChild hint={activity.description ?? preview}>
            <Text
              variant="body"
              className={cn('truncate', completed && 'text-muted-foreground line-through')}
            >
              {preview}
            </Text>
          </HintTooltip>
          {activity.priority === 'high' && !completed ? (
            <BadgeSoft tone="negative" size="sm">
              {t('contacts.preview.priority.high')}
            </BadgeSoft>
          ) : null}
        </span>
        <Text variant="hint" className="flex flex-wrap items-center gap-x-1.5">
          <span>{t(`contacts.preview.activityKinds.${kind}`)}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(activity.createdAt, i18n.language)}</span>
          {activity.dueDate && !completed ? (
            <>
              <span aria-hidden>·</span>
              <span className={cn(overdue && 'font-medium text-warning-deep')}>
                {t(overdue ? 'contacts.preview.tasks.overdue' : 'contacts.preview.due', {
                  when: formatDateCO(activity.dueDate),
                })}
              </span>
            </>
          ) : null}
        </Text>
      </span>
    </li>
  )
}

type ActivityListProps = {
  readonly items: ReadonlyArray<ContactActivity>
  readonly isLoading: boolean
  readonly onToggle?: ToggleActivity
}

export function ActivityList({ items, isLoading, onToggle }: Readonly<ActivityListProps>) {
  if (isLoading) {
    return (
      <span className="flex flex-col gap-2 py-1">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-2/3" />
      </span>
    )
  }

  return (
    <ul className="-my-1 flex flex-col divide-y divide-border/60">
      {items.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} onToggle={onToggle} />
      ))}
    </ul>
  )
}
