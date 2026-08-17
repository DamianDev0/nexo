import { cn } from '@/shared/lib/cn'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { HintContent } from '@/shared/ui/molecules/hint-content'
import { DataTable } from '@/shared/ui/organisms/data-table'
import { Button } from '@/shared/ui/shadcn/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/ui/shadcn/hover-card'
import { Tooltip, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import { CONTACT_TAG_CHIP } from '../../config/contact-columns.constants'

import type { TagsCellLabels } from '../../model/types/contact-cells.types'
import type { Tag } from '@repo/shared-types'
import type { ReactNode } from 'react'

type TagsHoverCardProps = {
  readonly tags: ReadonlyArray<string>
  readonly labels: TagsCellLabels
  readonly byName?: ReadonlyMap<string, Tag>
  readonly children: ReactNode
}

function TagRow({ name, meta }: Readonly<{ name: string; meta?: Tag }>) {
  const label: ReactNode = (
    <span className="flex min-w-0 cursor-pointer items-center gap-2">
      <ColorDot color={meta?.color ?? ''} className={meta?.color ? undefined : 'bg-faint'} />
      <span className="truncate text-sm text-body">{name}</span>
    </span>
  )

  return (
    <span className="flex items-center rounded-sm px-1.5 py-1">
      {meta?.description ? (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>{label}</TooltipTrigger>
          <HintContent side="top" align="start">
            {meta.description}
          </HintContent>
        </Tooltip>
      ) : (
        label
      )}
    </span>
  )
}

export function ContactTagsHoverCard({
  tags,
  labels,
  byName,
  children,
}: Readonly<TagsHoverCardProps>) {
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent align="start" className="w-56 p-2">
        <p className="px-1.5 pb-1 text-xs font-medium text-muted-foreground">{labels.title}</p>
        <span className="flex max-h-56 flex-col overflow-y-auto">
          {tags.map((tag) => (
            <TagRow key={tag} name={tag} meta={byName?.get(tag.toLowerCase())} />
          ))}
        </span>
      </HoverCardContent>
    </HoverCard>
  )
}

type ContactTagsCellProps = {
  readonly tags: ReadonlyArray<string>
  readonly labels: TagsCellLabels
  readonly byName?: ReadonlyMap<string, Tag>
}

function TagChip({ name, meta }: Readonly<{ name: string; meta?: Tag }>) {
  return (
    <span className={cn(CONTACT_TAG_CHIP, 'min-w-0 gap-1 truncate')}>
      {meta?.color && <ColorDot color={meta.color} className="size-1.5" />}
      {name}
    </span>
  )
}

export function ContactTagsCell({ tags, labels, byName }: Readonly<ContactTagsCellProps>) {
  const [only] = tags
  if (only === undefined) return <DataTable.CellText>{null}</DataTable.CellText>

  if (tags.length === 1) {
    const meta = byName?.get(only.toLowerCase())
    const chip = <TagChip name={only} meta={meta} />
    if (!meta?.description) return chip

    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span className="inline-flex min-w-0 cursor-pointer">{chip}</span>
        </TooltipTrigger>
        <HintContent side="top" align="start">
          {meta.description}
        </HintContent>
      </Tooltip>
    )
  }

  return (
    <ContactTagsHoverCard tags={tags} labels={labels} byName={byName}>
      <Button
        variant="ghost"
        size="xs"
        aria-label={labels.title}
        className={cn(CONTACT_TAG_CHIP, 'shrink-0 cursor-pointer hover:bg-accent')}
      >
        {labels.count(tags.length)}
      </Button>
    </ContactTagsHoverCard>
  )
}
