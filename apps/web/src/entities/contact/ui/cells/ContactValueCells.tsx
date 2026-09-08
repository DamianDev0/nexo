import { formatDateTimeCO, timeAgo } from '@repo/shared-utils'

import { cn } from '@/shared/lib/cn'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { Text } from '@/shared/ui/atoms/text'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { DataTable } from '@/shared/ui/organisms/data-table'

import { CONTACT_STALE_DAYS } from '../../config/contact-columns.constants'
import { contactCreatedParts } from '../../lib/contact-display'
import { daysSince } from '../../lib/contact-links'

import { ContactChoiceCell } from './ContactChoiceCell'

import type { ChoiceCellSelection } from './ContactChoiceCell'
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

  return (
    <ContactChoiceCell
      label={choice?.label ?? contact.status}
      selection={{
        value: contact.status,
        options,
        onChange: onChange
          ? (status) => {
              if (status !== null) onChange(contact.id, status)
            }
          : undefined,
      }}
    >
      {label}
    </ContactChoiceCell>
  )
}

export function ContactTaxonomyCell({
  value,
  choice,
  label,
  selection,
}: Readonly<{
  value: string | null
  choice: TaxonomyChoice | undefined
  label: string
  selection: Omit<ChoiceCellSelection, 'value'>
}>) {
  const display = choice ? (
    <span className="flex min-w-0 items-center gap-1.5">
      <ColorDot color={choice.color} />
      <TruncateTip>{choice.label}</TruncateTip>
    </span>
  ) : (
    <DataTable.CellText muted>{value}</DataTable.CellText>
  )

  return (
    <ContactChoiceCell label={label} selection={{ ...selection, value }}>
      {display}
    </ContactChoiceCell>
  )
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
    <time dateTime={iso} className="flex min-w-0 flex-col">
      <Text title={date} className="truncate font-light tabular-nums">
        {date}
      </Text>
      <Text variant="hint" title={time} className="truncate font-light tabular-nums">
        {time}
      </Text>
    </time>
  )
}
