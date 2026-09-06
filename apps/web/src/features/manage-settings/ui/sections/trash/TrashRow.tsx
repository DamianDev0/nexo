'use client'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { ArrowCounterClockwiseIcon } from '@/shared/ui/icons'
import { ListRow } from '@/shared/ui/molecules/list-row'

import type { ReactNode } from 'react'

type TrashRowProps = {
  readonly title: string
  readonly subtitle?: ReactNode
  readonly restore: {
    readonly label: string
    readonly onClick: () => void
    readonly disabled?: boolean
  }
}

export function TrashRow({ title, subtitle, restore }: Readonly<TrashRowProps>) {
  return (
    <ListRow>
      <span className="flex min-w-0 flex-1 flex-col">
        <Text variant="strong" className="truncate">
          {title}
        </Text>
        {subtitle && (
          <Text variant="faint" className="truncate">
            {subtitle}
          </Text>
        )}
      </span>
      <PillButton
        variant="outline"
        size="xs"
        className="gap-1.5"
        disabled={restore.disabled}
        onClick={restore.onClick}
      >
        <ArrowCounterClockwiseIcon className="size-3.5" />
        {restore.label}
      </PillButton>
    </ListRow>
  )
}
