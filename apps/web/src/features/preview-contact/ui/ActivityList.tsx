'use client'

import { timeAgo } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import {
  activityPreview,
  isActivityCompleted,
  resolveActivityType,
  useActivityCatalog,
} from '@/entities/activity'
import { cn } from '@/shared/lib'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { Text } from '@/shared/ui/atoms/text'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { RecordCard } from '@/shared/ui/molecules/record-card'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { activityDue } from '../lib/activity-card'

import { ActivityKindMark } from './ActivityKindMark'

import type { ToggleActivity } from './ActivityKindMark'
import type { ContactActivity } from '@repo/shared-types'

function ActivityRow({
  activity,
  onToggle,
}: Readonly<{ activity: ContactActivity; onToggle?: ToggleActivity }>) {
  const { t, i18n } = useTranslation()
  const type = resolveActivityType(activity.activityType, useActivityCatalog())
  const completed = isActivityCompleted(activity)
  const due = activityDue(t, activity)
  const preview = activityPreview(activity)

  return (
    <RecordCard.Row>
      <span className="mt-0.5">
        <ActivityKindMark activity={activity} completed={completed} onToggle={onToggle} />
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
          <span>{type.label}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(activity.createdAt, i18n.language)}</span>
          {due ? (
            <span className={cn('pl-1.5 font-medium', due.overdue && 'text-warning-deep')}>
              {due.label}
            </span>
          ) : null}
        </Text>
      </span>
    </RecordCard.Row>
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
    <RecordCard.List className="-my-1 divide-y divide-border/60">
      {items.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} onToggle={onToggle} />
      ))}
    </RecordCard.List>
  )
}
