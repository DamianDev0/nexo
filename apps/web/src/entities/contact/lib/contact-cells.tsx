import { contactFullName } from '@/entities/contact'
import { cn } from '@/shared/lib/cn'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { DataTable } from '@/shared/ui/organisms/data-table'

import { CONTACT_TAG_CHIP } from '../config/contact-columns.constants'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactListItem } from '@repo/shared-types'

const TAG_SEPARATOR = ' · '

export function ContactNameCell({ contact }: Readonly<{ contact: ContactListItem }>) {
  return (
    <TruncateTip className="text-sm font-medium tracking-tight text-foreground">
      {contactFullName(contact)}
    </TruncateTip>
  )
}

export function ContactStatusCell({
  status,
  choice,
}: Readonly<{ status: string; choice?: TaxonomyChoice }>) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {choice?.color && <ColorDot color={choice.color} />}
      <TruncateTip>{choice?.label ?? status}</TruncateTip>
    </span>
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
