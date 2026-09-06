'use client'

import { AvatarSquircle } from '@/shared/ui/atoms/avatar-squircle'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { Text } from '@/shared/ui/atoms/text'

import type { BulkChoiceOption } from '../model/types/bulk-actions.types'

type BulkChoiceRowProps = {
  readonly option: BulkChoiceOption
  readonly compact?: boolean
}

export function BulkChoiceRow({ option, compact = false }: Readonly<BulkChoiceRowProps>) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2.5">
      {option.initials !== undefined && (
        <AvatarSquircle
          initials={option.initials}
          size={compact ? 'kanban' : 'table'}
          tone="neutral"
          className={compact ? undefined : 'size-8 rounded-full text-[11px]'}
        />
      )}
      {option.color !== undefined && <ColorDot color={option.color ?? 'var(--muted-foreground)'} />}
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <Text variant="body" className="truncate">
          {option.label}
        </Text>
        {!compact && option.description && (
          <Text variant="hint" className="truncate">
            {option.description}
          </Text>
        )}
      </span>
      {!compact && option.badge && (
        <BadgeSoft tone="neutral" className="h-6 shrink-0 px-2 text-[11px] font-medium">
          {option.badge}
        </BadgeSoft>
      )}
    </span>
  )
}
