'use client'

import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

interface OptionRowNameProps {
  readonly name: string
  readonly description: string | null
}

export function OptionRowName({ name, description }: Readonly<OptionRowNameProps>) {
  if (!description) {
    return <span className="min-w-0 flex-1 truncate px-2 text-sm text-foreground">{name}</span>
  }

  return (
    <span className="flex min-w-0 flex-1 px-2 text-sm text-foreground">
      <HintTooltip hint={description}>{name}</HintTooltip>
    </span>
  )
}
