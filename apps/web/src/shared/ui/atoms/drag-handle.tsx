import { DotsSixVerticalIcon } from '@/shared/ui/icons'

import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

export interface DragHandleBinding {
  readonly attributes: DraggableAttributes
  readonly listeners: SyntheticListenerMap | undefined
}

interface DragHandleProps {
  readonly handle?: DragHandleBinding
  readonly label: string
}

export function DragHandle({ handle, label }: Readonly<DragHandleProps>) {
  return (
    <span
      {...handle?.attributes}
      {...handle?.listeners}
      className="flex size-6 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground/60 transition-colors hover:text-muted-foreground active:cursor-grabbing"
      aria-label={label}
    >
      <DotsSixVerticalIcon className="size-4" />
    </span>
  )
}
