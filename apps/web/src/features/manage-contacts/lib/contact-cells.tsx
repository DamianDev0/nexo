import { contactAvatarTone, contactFullName, contactInitials } from '@/entities/contact'
import { AvatarSquircle } from '@/shared/ui/atoms/avatar-squircle'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { DotsThreeIcon } from '@/shared/ui/icons'
import { DataTable } from '@/shared/ui/organisms/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'

import type { ContactListItem } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export const MAX_VISIBLE_TAGS = 2

export function ContactNameCell({ contact }: Readonly<{ contact: ContactListItem }>) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <AvatarSquircle initials={contactInitials(contact)} tone={contactAvatarTone(contact.id)} />
      <DataTable.RowTitle title={contactFullName(contact)} subtitle={contact.email ?? undefined} />
    </span>
  )
}

export function ContactTagsCell({ tags }: Readonly<{ tags: ReadonlyArray<string> }>) {
  if (tags.length === 0) return <DataTable.CellText>{null}</DataTable.CellText>

  const hidden = tags.length - MAX_VISIBLE_TAGS

  return (
    <span className="flex min-w-0 items-center gap-1">
      {tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
        <BadgeSoft key={tag}>{tag}</BadgeSoft>
      ))}
      {hidden > 0 && (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">+{hidden}</span>
      )}
    </span>
  )
}

interface ContactRowActionsProps {
  readonly t: TFunction
  readonly onEdit: () => void
  readonly onArchive: () => void
}

export function ContactRowActions({ t, onEdit, onArchive }: Readonly<ContactRowActionsProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PillButton variant="ghost" size="sm" aria-label={t('contacts.actions.open')}>
          <DotsThreeIcon className="size-4" />
        </PillButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>{t('contacts.actions.edit')}</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onArchive}>
          {t('contacts.actions.archive')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
