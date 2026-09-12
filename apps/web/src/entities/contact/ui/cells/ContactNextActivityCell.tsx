import { formatDateCO, timeAgo } from '@repo/shared-utils'

import {
  activityIconByName,
  isActivityOverdue,
  resolveActivityType,
  useActivityCatalog,
} from '@/entities/activity'
import { cn } from '@/shared/lib/cn'
import { Text } from '@/shared/ui/atoms/text'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { DataTable } from '@/shared/ui/organisms/data-table'

import type { NextActivityCellLabels } from '../../model/types/contact-cells.types'
import type { ContactNextActivity } from '@repo/shared-types'

type ContactNextActivityCellProps = {
  readonly activity: ContactNextActivity | null
  readonly locale: string
  readonly labels: NextActivityCellLabels
}

export function ContactNextActivityCell({
  activity,
  locale,
  labels,
}: Readonly<ContactNextActivityCellProps>) {
  const catalog = useActivityCatalog()
  if (activity === null) return <DataTable.CellText muted>{null}</DataTable.CellText>

  const type = resolveActivityType(activity.activityType, catalog)
  const overdue = isActivityOverdue({ dueDate: activity.dueDate, status: 'pending' })
  const when = overdue ? labels.overdue : timeAgo(activity.dueDate, locale)
  const hint = `${type.label} · ${formatDateCO(activity.dueDate)}`

  return (
    <HintTooltip asChild hint={activity.title ? `${activity.title} · ${hint}` : hint}>
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          aria-hidden
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-3',
            overdue && 'bg-warning-surface text-warning-deep',
            activity.priority === 'high' && !overdue && 'text-negative-text',
          )}
        >
          {activityIconByName(type.icon)}
        </span>
        <span className="flex min-w-0 flex-col">
          <Text className="truncate text-sm">{activity.title ?? type.label}</Text>
          <Text
            variant="faint"
            className={cn('truncate', overdue && 'font-medium text-warning-deep')}
          >
            {when}
          </Text>
        </span>
      </span>
    </HintTooltip>
  )
}
