'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { cn } from '@/shared/lib/cn'

import type { DragHandleBinding } from '@/shared/ui/atoms/drag-handle'
import type { ReactNode } from 'react'

interface SortableRowProps {
  readonly id: string
  readonly children: (handle: DragHandleBinding) => ReactNode
}

export function SortableRow({ id, children }: Readonly<SortableRowProps>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'opacity-40')}
    >
      {children({ attributes, listeners })}
    </div>
  )
}
