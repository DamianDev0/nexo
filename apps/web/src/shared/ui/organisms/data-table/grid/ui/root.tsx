'use client'

import { cn } from '@/shared/lib'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { DataTableProvider } from '../../model/context'

import type { DataTableInstance } from '../../model/use-data-table'
import type { ReactNode } from 'react'

interface DataTableRootProps<TData> {
  readonly instance: DataTableInstance<TData>
  readonly children: ReactNode
  readonly className?: string
}

export function DataTableRoot<TData>({
  instance,
  children,
  className,
}: Readonly<DataTableRootProps<TData>>) {
  return (
    <DataTableProvider value={instance as DataTableInstance<unknown>}>
      <TooltipProvider delayDuration={350}>
        <div data-slot="table-root" className={cn('overflow-hidden rounded-xl bg-card', className)}>
          {children}
        </div>
      </TooltipProvider>
    </DataTableProvider>
  )
}
