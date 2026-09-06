import { formatDateTimeCO, timeAgo } from '@repo/shared-utils'

import { cn } from '@/shared/lib/cn'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CaretDownIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { DataTable } from '@/shared/ui/organisms/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'

import { contactCreatedParts } from '../../lib/contact-display'
import { CONTACT_STALE_DAYS } from '../../config/contact-columns.constants'
import { daysSince } from '../../lib/contact-links'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactListItem } from '@repo/shared-types'

interface ContactStatusCellProps {
  readonly contact: ContactListItem
  readonly choice?: TaxonomyChoice
  readonly options: ReadonlyArray<TaxonomyChoice>
  readonly locale: string
  readonly onChange?: (contactId: string, status: string) => void
}

export function ContactStatusCell({
  contact,
  choice,
  options,
  locale,
  onChange,
}: Readonly<ContactStatusCellProps>) {
  const label = (
    <span className="flex min-w-0 flex-col text-left">
      <span className="flex min-w-0 items-center gap-1.5">
        {choice?.color && <ColorDot color={choice.color} />}
        <TruncateTip>{choice?.label ?? contact.status}</TruncateTip>
      </span>
      {contact.statusChangedAt && (
        <Text variant="faint" className="pl-3">
          {timeAgo(contact.statusChangedAt, locale)}
        </Text>
      )}
    </span>
  )

  if (!onChange || options.length === 0) return label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PillButton
          variant="ghost"
          size="sm"
          data-slot="status-picker"
          className="h-auto w-full justify-between gap-1 rounded-md px-1 py-0.5 font-normal hover:bg-muted"
        >
          {label}
          <CaretDownIcon className="size-3.5 shrink-0 text-faint" />
        </PillButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.key}
            disabled={option.key === contact.status}
            onSelect={() => onChange(contact.id, option.key)}
          >
            <ColorDot color={option.color} />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ContactStageCell({ label }: Readonly<{ label: string | null }>) {
  if (!label) return <DataTable.CellText>{null}</DataTable.CellText>

  return <BadgeSoft tone="outline">{label}</BadgeSoft>
}

export function ContactRelativeCell({
  iso,
  locale,
  staleLabel,
}: Readonly<{ iso: string | null; locale: string; staleLabel: string }>) {
  if (!iso) return <DataTable.CellText numeric>{null}</DataTable.CellText>

  const stale = daysSince(iso) > CONTACT_STALE_DAYS
  const hint = stale ? `${formatDateTimeCO(iso)} · ${staleLabel}` : formatDateTimeCO(iso)

  return (
    <HintTooltip asChild hint={hint}>
      <span
        className={cn('cursor-default truncate text-sm', stale ? 'text-warning-deep' : 'text-body')}
      >
        {timeAgo(iso, locale)}
      </span>
    </HintTooltip>
  )
}

export function ContactCreatedCell({ iso, locale }: Readonly<{ iso: string; locale: string }>) {
  const { date, time } = contactCreatedParts(iso, locale)

  return (
    <span className="flex min-w-0 flex-col">
      <Text className="truncate tabular-nums">{date}</Text>
      <Text variant="faint" className="truncate font-light tabular-nums">
        {time}
      </Text>
    </span>
  )
}
