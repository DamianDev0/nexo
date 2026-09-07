'use client'

import { formatDateCO, timeAgo } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { activityKindKey, activityPreview, isActivityCompleted } from '../lib/activity-groups'
import { activityIcon } from '../lib/activity-icon'

import type { ContactActivity } from '@repo/shared-types'

function ActivityRow({ activity }: Readonly<{ activity: ContactActivity }>) {
  const { t, i18n } = useTranslation()
  const kind = activityKindKey(activity.activityType)
  const completed = isActivityCompleted(activity)
  const preview = activityPreview(activity)

  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-3.5',
          completed && 'bg-positive-surface text-positive-text',
        )}
      >
        {completed ? <CheckIcon /> : activityIcon(kind)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <HintTooltip asChild hint={activity.description ?? preview}>
          <Text
            variant="body"
            className={cn('truncate', completed && 'text-muted-foreground line-through')}
          >
            {preview}
          </Text>
        </HintTooltip>
        <Text variant="hint" className="flex flex-wrap items-center gap-x-1.5">
          <span>{t(`contacts.preview.activityKinds.${kind}`)}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(activity.createdAt, i18n.language)}</span>
          {activity.dueDate && !completed ? (
            <>
              <span aria-hidden>·</span>
              <span>{t('contacts.preview.due', { when: formatDateCO(activity.dueDate) })}</span>
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
}

export function ActivityList({ items, isLoading }: Readonly<ActivityListProps>) {
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
        <ActivityRow key={activity.id} activity={activity} />
      ))}
    </ul>
  )
}
