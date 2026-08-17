import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/ui/atoms/avatar'
import { SidebarSimpleIcon, TagIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { Button } from '@/shared/ui/shadcn/button'

import { CONTACT_NAME_TEXT, CONTACT_STRIP_BUTTON } from '../../config/contact-columns.constants'
import { contactAvatarUrl, contactFullName } from '../../lib/contact-display'

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

function TagsStripAction({ contact, labels, tagsByName }: Omit<StripContext, 'actions'>) {
  const { tags } = contact
  if (tags.length === 0) return null

  return (
    <ContactTagsHoverCard tags={tags} labels={labels.tags} byName={tagsByName}>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={labels.tags.title}
        className={CONTACT_STRIP_BUTTON}
      >
        <TagIcon className="size-3.5" />
        <CountBadge count={tags.length} />
      </Button>
    </ContactTagsHoverCard>
  )
}

function ActionStrip({ contact, labels, actions, tagsByName }: StripContext) {
  return (
    <span className="-ml-0.5 flex shrink-0 items-center gap-1">
      <TagsStripAction contact={contact} labels={labels} tagsByName={tagsByName} />
      {actions.onPreview && (
        <HintTooltip asChild hint={labels.preview}>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={labels.preview}
            onClick={() => actions.onPreview?.(contact)}
            className={CONTACT_STRIP_BUTTON}
          >
            <SidebarSimpleIcon className="size-3.5" />
          </Button>
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
    <Button
      variant="ghost"
      onClick={() => actions.onOpen?.(contact)}
      className={cn(
        'h-auto min-w-0 justify-start rounded-sm p-0 hover:bg-transparent hover:underline',
        CONTACT_NAME_TEXT,
      )}
    >
      <TruncateTip>{name}</TruncateTip>
    </Button>
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
