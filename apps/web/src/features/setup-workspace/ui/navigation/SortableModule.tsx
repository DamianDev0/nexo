'use client'

import { memo } from 'react'

import { SortableRow } from '@/shared/ui/molecules/sortable-row'

import { ModuleRow, type ModuleRowActions } from './ModuleRow'

import type { SidebarModule } from '@repo/shared-types'

interface SortableModuleProps {
  readonly module: SidebarModule
  readonly actions: ModuleRowActions
}

function SortableModuleBase({ module, actions }: Readonly<SortableModuleProps>) {
  return (
    <SortableRow id={module.key}>
      {(handle) => <ModuleRow module={module} actions={actions} handle={handle} />}
    </SortableRow>
  )
}

export const SortableModule = memo(SortableModuleBase)
