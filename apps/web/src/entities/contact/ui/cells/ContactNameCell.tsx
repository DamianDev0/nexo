import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/ui/atoms/avatar'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import {
  ArrowCounterClockwiseIcon,
  NotePencilIcon,
  SidebarSimpleIcon,
  TagIcon,
} from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'

import { CONTACT_NAME_TEXT, CONTACT_STRIP_BUTTON } from '../../config/contact-columns.constants'
import { contactAvatarUrl, contactFullName } from '../../lib/contact-display'
import { ContactNotesHoverCard } from '../containers/ContactNotesHoverCard'

import { ContactTagsHoverCard } from './ContactTagsCell'

import type { ContactNameActions, ContactNameLabels } from '../../model/types/contact-cells.types'
import type { ContactListItem, Tag } from '@repo/shared-types'
import type { ReactNode } from 'react'

type ContactNameCellProps = {
  readonly contact: ContactListItem
  readonly dense?: boolean
  readonly labels?: ContactNameLabels
  readonly actions?: ContactNameActions
  readonly tagsByName?: ReadonlyMap<string, Tag>
}

function CountBadge({ count }: Readonly<{ count: number }>) {
  if (count <= 0) return null

  return (
    <span className="absolute -right-0.5 -top-0.5 flex size-3 items-center justify-center rounded-full bg-primary text-[10px] font-medium tabular-nums leading-none text-primary-foreground">
      {count}
    </span>
  )
}

type StripContext = Readonly<{
  contact: ContactListItem
  labels: ContactNameLabels
  actions: ContactNameActions
  tagsByName?: ReadonlyMap<string, Tag>
}>

function TagsStripAction({ contact, labels, actions, tagsByName }: StripContext) {
  const { tags } = contact
  const onEditTags = actions.onEditTags
  if (tags.length === 0 && !onEditTags) return null

  const button = (
    <PillButton
      variant="ghost"
      size="xs"
      aria-label={onEditTags ? labels.editTags : labels.tags.title}
      onClick={onEditTags ? () => onEditTags(contact) : undefined}
      className={cn('w-8 px-0', CONTACT_STRIP_BUTTON)}
    >
      <TagIcon className="size-3.5" />
      <CountBadge count={tags.length} />
    </PillButton>
  )

  if (tags.length === 0) return button
  return (
    <ContactTagsHoverCard tags={tags} labels={labels.tags} byName={tagsByName}>
      {button}
    </ContactTagsHoverCard>
  )
}

function NotesStripAction({ contact, labels, actions }: Omit<StripContext, 'tagsByName'>) {
  const button = (
    <PillButton
      variant="ghost"
      size="xs"
      aria-label={labels.addNote}
      onClick={() => actions.onAddNote?.(contact)}
      className={cn('w-8 px-0', CONTACT_STRIP_BUTTON)}
    >
      <NotePencilIcon className="size-3.5" />
      <CountBadge count={contact.noteCount} />
    </PillButton>
  )

  if (contact.noteCount === 0) {
    return (
      <HintTooltip asChild hint={labels.addNote}>
        {button}
      </HintTooltip>
    )
  }
  return (
    <ContactNotesHoverCard contactId={contact.id} labels={labels.notes}>
      {button}
    </ContactNotesHoverCard>
  )
}

function ActionStrip({ contact, labels, actions, tagsByName }: StripContext) {
  const hasLeadingActions =
    contact.tags.length > 0 || Boolean(actions.onEditTags) || Boolean(actions.onAddNote)

  return (
    <span className="-ml-0.5 flex shrink-0 items-center gap-1">
      <TagsStripAction
        contact={contact}
        labels={labels}
        actions={actions}
        tagsByName={tagsByName}
      />
      {actions.onAddNote && (
        <NotesStripAction contact={contact} labels={labels} actions={actions} />
      )}
      {actions.onPreview && hasLeadingActions && (
        <span aria-hidden className="mx-0.5 h-3.5 w-px shrink-0 bg-border" />
      )}
      {!contact.isActive && actions.onRestore && (
        <HintTooltip asChild hint={labels.restore}>
          <PillButton
            variant="ghost"
            size="xs"
            aria-label={labels.restore}
            onClick={() => actions.onRestore?.(contact)}
            className={cn('w-8 px-0', CONTACT_STRIP_BUTTON)}
          >
            <ArrowCounterClockwiseIcon className="size-3.5" />
          </PillButton>
        </HintTooltip>
      )}
      {actions.onPreview && (
        <HintTooltip asChild hint={labels.preview}>
          <PillButton
            variant="ghost"
            size="xs"
            aria-label={labels.preview}
            onClick={() => actions.onPreview?.(contact)}
            className={cn('w-8 px-0', CONTACT_STRIP_BUTTON)}
          >
            <SidebarSimpleIcon className="size-3.5" />
          </PillButton>
        </HintTooltip>
      )}
    </span>
  )
}

export function ContactNameCell({
  contact,
  dense,
  labels,
  actions,
  tagsByName,
}: Readonly<ContactNameCellProps>) {
  const name = contactFullName(contact)

  const nameNode: ReactNode = actions?.onOpen ? (
    <PillButton
      variant="ghost"
      size="sm"
      onClick={() => actions.onOpen?.(contact)}
      className={cn(
        'h-auto min-w-0 justify-start rounded-sm p-0 hover:bg-transparent hover:underline',
        CONTACT_NAME_TEXT,
      )}
    >
      <TruncateTip>{name}</TruncateTip>
    </PillButton>
  ) : (
    <TruncateTip className={CONTACT_NAME_TEXT}>{name}</TruncateTip>
  )

  const strip = labels && actions && (
    <ActionStrip contact={contact} labels={labels} actions={actions} tagsByName={tagsByName} />
  )

  return (
    <span className="flex min-w-0 flex-1 items-center gap-2.5">
      <Avatar size="sm" variant="soft" className={cn('rounded-full', dense ? 'size-7' : 'size-9')}>
        <Avatar.Image src={contactAvatarUrl(contact)} alt="" className="bg-muted" />
        <Avatar.Fallback aria-label={name} className="bg-muted" />
      </Avatar>
      {dense ? (
        <span className="flex min-w-0 flex-1 items-center justify-between gap-1">
          {nameNode}
          {strip}
        </span>
      ) : (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          {nameNode}
          {strip}
        </span>
      )}
    </span>
  )
}
