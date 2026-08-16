import { formatDateCO, timeAgo } from '@repo/shared-utils'

import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/ui/atoms/avatar'
import { AvatarGradient } from '@/shared/ui/atoms/avatar-gradient'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { CaretDownIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { DataTable } from '@/shared/ui/organisms/data-table'
import { Button } from '@/shared/ui/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'

import { CONTACT_TAG_CHIP } from '../config/contact-columns.constants'

import { contactFullName } from './contact-display'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactListItem } from '@repo/shared-types'

const TAG_SEPARATOR = ' · '

export function ContactNameCell({
  contact,
  dense,
}: Readonly<{ contact: ContactListItem; dense?: boolean }>) {
  const name = contactFullName(contact)

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar size="sm" variant="soft" className={cn('rounded-full', dense ? 'size-7' : 'size-9')}>
        {contact.avatarUrl && <Avatar.Image src={contact.avatarUrl} alt="" className="bg-muted" />}
        <Avatar.Fallback aria-label={name} className="bg-transparent dark:bg-transparent">
          <AvatarGradient seed={contact.email ?? contact.id} />
        </Avatar.Fallback>
      </Avatar>
      <TruncateTip className="text-sm font-medium tracking-tight text-foreground">
        {name}
      </TruncateTip>
    </span>
  )
}

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
        <span className="pl-3 text-xs text-faint">{timeAgo(contact.statusChangedAt, locale)}</span>
      )}
    </span>
  )

  if (!onChange || options.length === 0) return label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          data-slot="status-picker"
          className="group/status h-auto w-full justify-between gap-1 rounded-md px-1 py-0.5 font-normal hover:bg-muted"
        >
          {label}
          <CaretDownIcon className="size-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover/status:opacity-100" />
        </Button>
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

export function ContactTagsCell({
  tags,
  label,
}: Readonly<{ tags: ReadonlyArray<string>; label: (count: number) => string }>) {
  const [only] = tags

  if (only === undefined) return <DataTable.CellText>{null}</DataTable.CellText>

  return (
    <span className="flex min-w-0 items-center">
      <HintTooltip asChild hint={tags.join(TAG_SEPARATOR)}>
        <span className={cn(CONTACT_TAG_CHIP, 'min-w-0 cursor-pointer truncate')}>
          {tags.length === 1 ? only : label(tags.length)}
        </span>
      </HintTooltip>
    </span>
  )
}

export function ContactStageCell({ label }: Readonly<{ label: string | null }>) {
  if (!label) return <DataTable.CellText>{null}</DataTable.CellText>

  return <BadgeSoft tone="outline">{label}</BadgeSoft>
}

export function ContactRelativeCell({
  iso,
  locale,
}: Readonly<{ iso: string | null; locale: string }>) {
  if (!iso) return <DataTable.CellText numeric>{null}</DataTable.CellText>

  return (
    <HintTooltip asChild hint={formatDateCO(iso)}>
      <span className="cursor-default truncate text-sm text-body">{timeAgo(iso, locale)}</span>
    </HintTooltip>
  )
}

export function ContactScoreCell({ score }: Readonly<{ score: number }>) {
  if (score <= 0) return <DataTable.CellText numeric>{null}</DataTable.CellText>

  return <BadgeSoft tone={score >= 70 ? 'positive' : 'neutral'}>{score}</BadgeSoft>
}
