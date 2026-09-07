'use client'

import { cn } from '@/shared/lib'
import { PagedTransition } from '@/shared/ui/molecules/paged-transition'
import { Sheet, SheetContent, SheetTitle } from '@/shared/ui/shadcn/sheet'

import { RecordDrawerEmpty, RecordDrawerFields } from './fields'
import { RecordDrawerHeader } from './header'
import { RecordDrawerHighlight } from './highlight'
import { RecordDrawerIdentity } from './identity'
import { isFloatingLayerTarget } from './lib/interact-outside'
import { RecordDrawerQuickActions } from './quick-actions'
import { RecordDrawerSection, RecordDrawerSections } from './sections'

import type { ReactNode } from 'react'

const keepOpenForFloatingLayers = (event: Event) => {
  if (isFloatingLayerTarget(event.target)) event.preventDefault()
}

type RecordDrawerRootProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly label: string
  readonly children: ReactNode
  readonly className?: string
}

function RecordDrawerRoot({
  open,
  onOpenChange,
  label,
  children,
  className,
}: Readonly<RecordDrawerRootProps>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        showCloseButton={false}
        aria-describedby={undefined}
        onInteractOutside={keepOpenForFloatingLayers}
        data-slot="record-drawer"
        className={cn(
          'z-40 w-full gap-0 p-0 sm:max-w-md data-[state=open]:duration-400',
          'shadow-e3 data-[state=open]:ease-[cubic-bezier(0.32,0.72,0,1)]',
          className,
        )}
      >
        <SheetTitle className="sr-only">{label}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  )
}

type RecordDrawerBodyProps = {
  readonly page: number
  readonly children: ReactNode
  readonly className?: string
}

function RecordDrawerBody({ page, children, className }: Readonly<RecordDrawerBodyProps>) {
  return (
    <div
      data-slot="record-drawer-body"
      className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]"
    >
      <PagedTransition page={page} className={cn('flex flex-col', className)}>
        {children}
      </PagedTransition>
    </div>
  )
}

function RecordDrawerFooter({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      data-slot="record-drawer-footer"
      className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-4 py-3"
    >
      {children}
    </div>
  )
}

export const RecordDrawer = Object.assign(RecordDrawerRoot, {
  Header: RecordDrawerHeader,
  Body: RecordDrawerBody,
  Identity: RecordDrawerIdentity,
  QuickActions: RecordDrawerQuickActions,
  Highlight: RecordDrawerHighlight,
  Sections: RecordDrawerSections,
  Section: RecordDrawerSection,
  Fields: RecordDrawerFields,
  Empty: RecordDrawerEmpty,
  Footer: RecordDrawerFooter,
})

export { useRecordPager } from './model/use-record-pager'
export { buildRecordDrawerLabels } from './lib/labels'
export type {
  FieldRow,
  QuickAction,
  RecordDrawerLabels,
  RecordPager,
  SectionAction,
  SectionMeta,
} from './types'
