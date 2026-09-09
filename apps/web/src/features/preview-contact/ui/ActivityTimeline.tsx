'use client'

import { formatDateCO } from '@repo/shared-utils'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { SegmentedControl } from '@/shared/ui/molecules/segmented-control'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'

import {
  ACTIVITY_TIMELINE_FILTERS,
  filterActivities,
  groupActivitiesByDay,
  relativeDayKey,
} from '../lib/activity-timeline'

import { ActivityList } from './ActivityList'

import type { ActivityTimelineFilter } from '../lib/activity-timeline'
import type { ContactTimelineFeed } from '@/entities/contact'
import type { SectionAction } from '@/shared/ui/organisms/record-drawer'
import type { ContactActivity } from '@repo/shared-types'

type ActivityTimelineProps = {
  readonly feed: ContactTimelineFeed
  readonly onToggle?: (activity: ContactActivity) => void
  readonly emptyAction?: SectionAction
}

export function ActivityTimeline({ feed, onToggle, emptyAction }: Readonly<ActivityTimelineProps>) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<ActivityTimelineFilter>('all')
  const options = useMemo(
    () =>
      ACTIVITY_TIMELINE_FILTERS.map((value) => ({
        value,
        label: t(`contacts.preview.timeline.filters.${value}`),
      })),
    [t],
  )
  const days = useMemo(
    () => groupActivitiesByDay(filterActivities(feed.activities, filter)),
    [feed.activities, filter],
  )

  if (feed.isError) {
    return (
      <span className="flex flex-col items-start gap-2 py-1">
        <Text variant="muted">{t('contacts.preview.timeline.error')}</Text>
        <PillButton variant="outline" size="xs" onClick={feed.retry}>
          {t('contacts.preview.timeline.retry')}
        </PillButton>
      </span>
    )
  }

  if (feed.activities.length === 0 && !feed.isLoading) {
    return <RecordDrawer.Empty label={t('contacts.preview.empty.activity')} action={emptyAction} />
  }

  return (
    <span className="flex flex-col gap-3">
      <SegmentedControl value={filter} onValueChange={setFilter} options={options} />
      {feed.isLoading ? <ActivityList items={[]} isLoading /> : null}
      {days.map(({ day, items }) => {
        const relative = relativeDayKey(day)
        return (
          <span key={day} className="flex flex-col gap-1">
            <Text variant="hint" className="font-medium uppercase tracking-wide">
              {relative
                ? t(`contacts.preview.timeline.${relative}`)
                : formatDateCO(`${day}T12:00:00-05:00`)}
            </Text>
            <ActivityList items={items} isLoading={false} onToggle={onToggle} />
          </span>
        )
      })}
      {days.length === 0 && !feed.isLoading ? (
        <Text variant="muted">{t('contacts.preview.timeline.noneForFilter')}</Text>
      ) : null}
      {feed.hasMore ? (
        <PillButton
          variant="outline"
          size="xs"
          onClick={feed.loadMore}
          disabled={feed.isFetchingMore}
          className="self-start"
        >
          {t(feed.isFetchingMore ? 'common.loading' : 'contacts.preview.timeline.loadMore')}
        </PillButton>
      ) : null}
    </span>
  )
}
