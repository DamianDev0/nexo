'use client'

import { timeAgo } from '@repo/shared-utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isActivityCompleted, resolveActivityType, useActivityCatalog } from '@/entities/activity'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { CaretDownIcon, CaretRightIcon, ClockIcon } from '@/shared/ui/icons'
import { RecordCard } from '@/shared/ui/molecules/record-card'
import { SkeletonList } from '@/shared/ui/molecules/skeleton-list'

import { activityDue, isExpandableText } from '../lib/activity-card'

import { ActivityKindMark } from './ActivityKindMark'

import type { ToggleActivity } from './ActivityKindMark'
import type { ContactActivity } from '@repo/shared-types'

function ActivityCard({
  activity,
  onToggle,
}: Readonly<{ activity: ContactActivity; onToggle?: ToggleActivity }>) {
  const { t, i18n } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const type = resolveActivityType(activity.activityType, useActivityCatalog())
  const completed = isActivityCompleted(activity)
  const due = activityDue(t, activity)
  const body = activity.description
  const expandable = isExpandableText(body)

  return (
    <RecordCard>
      <RecordCard.Header>
        <RecordCard.Slot>
          {expandable ? (
            <PillButton
              variant="ghost"
              size="xs"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-label={t(
                expanded ? 'contacts.preview.card.collapse' : 'contacts.preview.card.expand',
              )}
              className="size-5 rounded-md p-0 text-muted-foreground hover:text-foreground [&_svg]:size-3.5"
            >
              {expanded ? <CaretDownIcon /> : <CaretRightIcon />}
            </PillButton>
          ) : null}
        </RecordCard.Slot>
        <ActivityKindMark activity={activity} completed={completed} onToggle={onToggle} size="md" />
        <BadgeSoft tone="outline" size="sm" color={type.color ?? undefined}>
          {type.label}
        </BadgeSoft>
        {activity.priority === 'high' && !completed ? (
          <BadgeSoft tone="negative" size="sm">
            {t('contacts.preview.priority.high')}
          </BadgeSoft>
        ) : null}
        <RecordCard.Aside>{timeAgo(activity.createdAt, i18n.language)}</RecordCard.Aside>
      </RecordCard.Header>

      {due ? (
        <RecordCard.Meta icon={<ClockIcon aria-hidden />} tone={due.overdue ? 'danger' : 'neutral'}>
          {due.label}
        </RecordCard.Meta>
      ) : null}

      {activity.title ? (
        <RecordCard.Title muted={completed}>{activity.title}</RecordCard.Title>
      ) : null}

      {body ? <RecordCard.Body clamped={!expanded}>{body}</RecordCard.Body> : null}
    </RecordCard>
  )
}

type ActivityCardListProps = {
  readonly items: ReadonlyArray<ContactActivity>
  readonly isLoading: boolean
  readonly onToggle?: ToggleActivity
}

export function ActivityCardList({ items, isLoading, onToggle }: Readonly<ActivityCardListProps>) {
  if (isLoading) return <SkeletonList rows={3} className="gap-2" rowClassName="h-24 rounded-xl" />

  return (
    <RecordCard.List>
      {items.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} onToggle={onToggle} />
      ))}
    </RecordCard.List>
  )
}
