'use client'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { MinusIcon } from '@/shared/ui/icons'

type DockHeaderProps = {
  readonly title: string
  readonly minimizeLabel: string
  readonly onMinimize: () => void
}

export function DockHeader({ title, minimizeLabel, onMinimize }: Readonly<DockHeaderProps>) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-border pr-2 pl-4">
      <span aria-hidden className="size-2.5 rounded-full bg-positive" />
      <Text variant="strong" className="flex-1">
        {title}
      </Text>
      <PillButton
        variant="ghost"
        size="xs"
        aria-label={minimizeLabel}
        onClick={onMinimize}
        className="w-8 px-0"
      >
        <MinusIcon className="size-4" />
      </PillButton>
    </div>
  )
}
