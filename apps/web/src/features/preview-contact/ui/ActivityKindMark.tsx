'use client'

import { useTranslation } from 'react-i18next'

import {
  activityIconByName,
  isActivityToggleable,
  resolveActivityType,
  useActivityCatalog,
} from '@/entities/activity'
import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { CheckIcon } from '@/shared/ui/icons'

import type { ContactActivity } from '@repo/shared-types'

export type ToggleActivity = (activity: ContactActivity) => void

type ActivityKindMarkProps = {
  readonly activity: ContactActivity
  readonly completed: boolean
  readonly onToggle?: ToggleActivity
  readonly size?: 'sm' | 'md'
}

const SIZES = {
  sm: 'size-6 [&_svg]:size-3.5',
  md: 'size-7 [&_svg]:size-4',
} as const

export function ActivityKindMark({
  activity,
  completed,
  onToggle,
  size = 'sm',
}: Readonly<ActivityKindMarkProps>) {
  const { t } = useTranslation()
  const type = resolveActivityType(activity.activityType, useActivityCatalog())
  const tint =
    completed || type.color === null
      ? undefined
      : {
          backgroundColor: `color-mix(in oklab, ${type.color} 14%, transparent)`,
          color: type.color,
        }
  const mark = (
    <span
      aria-hidden
      style={tint}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
        SIZES[size],
        completed && 'bg-positive-surface text-positive-text',
      )}
    >
      {completed ? <CheckIcon /> : activityIconByName(type.icon)}
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
      className={cn('shrink-0 rounded-md p-0 hover:bg-accent', SIZES[size])}
    >
      {mark}
    </PillButton>
  )
}
