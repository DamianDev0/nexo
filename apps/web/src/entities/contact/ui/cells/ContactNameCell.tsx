import { cn } from '@/shared/lib/cn'
import { AlertMark } from '@/shared/ui/atoms/alert-mark'
import { Avatar } from '@/shared/ui/atoms/avatar'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'

import { CONTACT_NAME_TEXT } from '../../config/contact-columns.constants'
import { missingContactFields } from '../../lib/contact-completeness'
import { contactAvatarUrl, contactFullName } from '../../lib/contact-display'

import { ContactActionStrip } from './ContactActionStrip'

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

export function ContactNameCell({
  contact,
  dense,
  labels,
  actions,
  tagsByName,
}: Readonly<ContactNameCellProps>) {
  const name = contactFullName(contact)
  const missingHint = labels?.missing(missingContactFields(contact)) ?? null

  const nameText: ReactNode = actions?.onOpen ? (
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
  const nameNode: ReactNode = missingHint ? (
    <span className="flex min-w-0 items-center gap-1.5">
      <AlertMark hint={missingHint} />
      {nameText}
    </span>
  ) : (
    nameText
  )

  const strip = labels && actions && (
    <ContactActionStrip
      contact={contact}
      labels={labels}
      actions={actions}
      tagsByName={tagsByName}
    />
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
