'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { memo } from 'react'

import { cn } from '@/shared/lib/cn'

import { FieldRow } from './FieldRow'

import type { FieldRowActions } from './FieldRow'
import type { FieldDef } from '@repo/shared-types'

interface SortableFieldRowProps {
  readonly field: FieldDef
  readonly actions: FieldRowActions
}

function SortableFieldRowBase({ field, actions }: Readonly<SortableFieldRowProps>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.key,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'opacity-40')}
    >
      <FieldRow field={field} actions={actions} handle={{ attributes, listeners }} />
    </div>
  )
}

export const SortableFieldRow = memo(SortableFieldRowBase)
