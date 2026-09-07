'use client'

import { useState } from 'react'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { NotePencilIcon } from '@/shared/ui/icons'
import { HintContent } from '@/shared/ui/molecules/hint-content'
import { DataTable } from '@/shared/ui/organisms/data-table'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/ui/shadcn/hover-card'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { Tooltip, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import { useContactNotes } from '../../query/useContactNotes'

import type { NotesCellLabels } from '../../model/types/contact-cells.types'
import type { ContactActivity, ContactListItem } from '@repo/shared-types'
import type { ReactNode } from 'react'

type ContactNotesHoverCardProps = {
  readonly contactId: string
  readonly labels: NotesCellLabels
  readonly children: ReactNode
}

function NoteRow({ note }: Readonly<{ note: ContactActivity }>) {
  const preview = note.title ?? note.description ?? ''
  const full = note.description ?? preview

  return (
    <span className="flex items-center rounded-sm px-1.5 py-1 transition-colors hover:bg-muted/60">
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span className="min-w-0 cursor-pointer">
            <Text
              variant="body"
              className="block truncate font-medium text-primary-deep underline decoration-primary-deep/40 underline-offset-2 transition-colors hover:decoration-primary-deep dark:text-primary dark:decoration-primary/40 dark:hover:decoration-primary"
            >
              {preview}
            </Text>
          </span>
        </TooltipTrigger>
        <HintContent side="top" align="start">
          {full}
        </HintContent>
      </Tooltip>
    </span>
  )
}

export function ContactNotesHoverCard({
  contactId,
  labels,
  children,
}: Readonly<ContactNotesHoverCardProps>) {
  const [opened, setOpened] = useState(false)
  const { notes, isLoading } = useContactNotes(contactId, opened)

  return (
    <HoverCard
      openDelay={150}
      closeDelay={100}
      onOpenChange={(open) => {
        if (open) setOpened(true)
      }}
    >
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent align="start" className="z-30 w-64 p-2">
        <Text as="p" variant="hint" className="px-1.5 pb-1 font-medium">
          {labels.title}
        </Text>
        {isLoading ? (
          <span className="flex flex-col gap-1.5 px-1.5 py-1">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3.5 w-3/5" />
          </span>
        ) : (
          <span className="flex max-h-56 flex-col overflow-y-auto">
            {notes.map((note) => (
              <NoteRow key={note.id} note={note} />
            ))}
          </span>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}

type ContactNotesCellProps = {
  readonly contact: ContactListItem
  readonly labels: NotesCellLabels
  readonly onAddNote?: (contact: ContactListItem) => void
}

export function ContactNotesCell({ contact, labels, onAddNote }: Readonly<ContactNotesCellProps>) {
  if (contact.noteCount === 0) return <DataTable.CellText>{null}</DataTable.CellText>

  return (
    <ContactNotesHoverCard contactId={contact.id} labels={labels}>
      <PillButton
        variant="ghost"
        size="xs"
        aria-label={labels.title}
        onClick={onAddNote ? () => onAddNote(contact) : undefined}
        className="gap-1 px-1.5"
      >
        <NotePencilIcon className="size-3.5 text-muted-foreground" />
        <Text variant="body" className="tabular-nums">
          {contact.noteCount}
        </Text>
      </PillButton>
    </ContactNotesHoverCard>
  )
}
