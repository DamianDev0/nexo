import { cn } from '@/shared/lib/cn'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import {
  ArrowCounterClockwiseIcon,
  DotsThreeIcon,
  NotePencilIcon,
  SidebarSimpleIcon,
  TagIcon,
} from '@/shared/ui/icons'
import { ActionMenu } from '@/shared/ui/molecules/action-menu'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { CONTACT_STRIP_BUTTON } from '../../config/contact-columns.constants'
import { buildRowMenuItems } from '../../lib/row-menu-items'
import { ContactNotesHoverCard } from '../containers/ContactNotesHoverCard'

import { ContactTagsHoverCard } from './ContactTagsCell'

import type { ContactNameLabels, ContactRowActions } from '../../model/types/contact-cells.types'
import type { ContactListItem, Tag } from '@repo/shared-types'

function CountBadge({ count }: Readonly<{ count: number }>) {
  if (count <= 0) return null

  return (
    <Text
      variant="micro"
      className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-primary leading-none font-medium text-primary-foreground tabular-nums"
    >
      {count}
    </Text>
  )
}

type StripContext = Readonly<{
  contact: ContactListItem
  labels: ContactNameLabels
  actions: ContactRowActions
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

function RowMenu({ contact, labels, actions }: Omit<StripContext, 'tagsByName'>) {
  const items = buildRowMenuItems(contact, labels, actions)
  if (items.length === 0) return null

  return (
    <ActionMenu items={items} align="start">
      <PillButton
        variant="ghost"
        size="xs"
        aria-label={labels.rowMenu}
        className={cn('w-8 px-0', CONTACT_STRIP_BUTTON)}
      >
        <DotsThreeIcon className="size-3.5" />
      </PillButton>
    </ActionMenu>
  )
}

export function ContactActionStrip({ contact, labels, actions, tagsByName }: StripContext) {
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
      <RowMenu contact={contact} labels={labels} actions={actions} />
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
