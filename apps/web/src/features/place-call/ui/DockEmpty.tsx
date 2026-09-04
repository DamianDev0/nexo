import { Text } from '@/shared/ui/atoms/text'

import type { ReactNode } from 'react'

type DockEmptyProps = {
  readonly icon: ReactNode
  readonly label: string
}

export function DockEmpty({ icon, label }: Readonly<DockEmptyProps>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
      {icon}
      <Text variant="muted">{label}</Text>
    </div>
  )
}
