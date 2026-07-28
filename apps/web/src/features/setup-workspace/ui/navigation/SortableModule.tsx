'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { memo } from 'react'

import { cn } from '@/shared/lib'

import { ModuleRow, type ModuleRowActions } from './ModuleRow'

import type { SidebarModule } from '@repo/shared-types'

interface SortableModuleProps {
  readonly module: SidebarModule
  readonly actions: ModuleRowActions
}

function SortableModuleBase({ module, actions }: Readonly<SortableModuleProps>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.key,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'opacity-40')}
    >
      <ModuleRow module={module} actions={actions} handle={{ attributes, listeners }} />
    </div>
  )
}

export const SortableModule = memo(SortableModuleBase)
