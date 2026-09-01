'use client'

import { Text } from '@/shared/ui/atoms/text'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

interface OptionRowNameProps {
  readonly name: string
  readonly description: string | null
}

export function OptionRowName({ name, description }: Readonly<OptionRowNameProps>) {
  if (!description) {
    return <Text className="min-w-0 flex-1 truncate px-2 text-foreground">{name}</Text>
  }

  return (
    <Text className="flex min-w-0 flex-1 px-2 text-foreground">
      <HintTooltip hint={description}>{name}</HintTooltip>
    </Text>
  )
}
