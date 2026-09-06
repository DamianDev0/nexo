'use client'

import { CONTACT_UNASSIGNED_RECENT_DAYS } from '@repo/shared-types'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { UserXIcon, XIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

type UnassignedBadgeProps = {
  readonly count: number
  readonly active: boolean
  readonly terms: { entity: string; entities: string }
  readonly onSelect: () => void
  readonly onClear: () => void
}

export function UnassignedBadge({
  count,
  active,
  terms,
  onSelect,
  onClear,
}: Readonly<UnassignedBadgeProps>) {
  const { t } = useTranslation()
  if (count === 0 && !active) return null

  return (
    <span
      data-slot="unassigned-badge"
      className={cn(
        'inline-flex h-8 shrink-0 items-center rounded-md bg-secondary text-secondary-foreground',
        active && 'pr-1',
      )}
    >
      <HintTooltip
        asChild
        side="right"
        hint={t('contacts.unassignedBadge.hint', {
          ...terms,
          days: CONTACT_UNASSIGNED_RECENT_DAYS,
        })}
      >
        <PillButton
          variant="ghost"
          size="xs"
          aria-pressed={active}
          aria-label={t('contacts.unassignedBadge.label')}
          onClick={onSelect}
          className="gap-1.5 rounded-md px-2 text-xs font-medium text-secondary-foreground hover:bg-muted"
        >
          <UserXIcon className="size-3.5" />
          <Text
            variant="fine"
            className="inline-flex items-center justify-center rounded-sm border border-border-strong/40 bg-card px-1.5 py-0.5 font-medium leading-none tabular-nums text-secondary-foreground"
          >
            {count}
          </Text>
        </PillButton>
      </HintTooltip>
      {active && (
        <PillButton
          variant="ghost"
          size="xs"
          aria-label={t('contacts.unassignedBadge.clear')}
          onClick={onClear}
          className="size-6 rounded-sm px-0 text-secondary-foreground hover:bg-muted"
        >
          <XIcon className="size-3.5" />
        </PillButton>
      )}
    </span>
  )
}
