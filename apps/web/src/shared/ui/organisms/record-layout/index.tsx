'use client'

import { cn } from '@/shared/lib'

import { RecordLayoutAside } from './aside'
import { RecordLayoutContext } from './context'
import { RecordLayoutContent, RecordLayoutMain, RecordLayoutTabs } from './main'
import { useRecordLayout } from './model/use-record-layout'
import { RecordLayoutPanel } from './panel'
import { RecordLayoutRail } from './rail'

import type { CSSProperties, ReactNode } from 'react'

const SIZES = {
  '--record-aside-width': '400px',
  '--record-panel-width': '380px',
  '--record-rail-width': '56px',
} as CSSProperties

type RecordLayoutRootProps = {
  readonly children: ReactNode
  readonly defaultPanel?: string | null
  readonly onPanelChange?: (panelId: string | null) => void
  readonly className?: string
}

function RecordLayoutRoot({
  children,
  defaultPanel,
  onPanelChange,
  className,
}: Readonly<RecordLayoutRootProps>) {
  const layout = useRecordLayout({ defaultPanel, onPanelChange })

  return (
    <RecordLayoutContext.Provider value={layout}>
      <div
        data-slot="record-layout"
        style={SIZES}
        className={cn('flex min-h-0 flex-1 overflow-hidden bg-background', className)}
      >
        {children}
      </div>
    </RecordLayoutContext.Provider>
  )
}

function RecordLayoutHeader({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div
      data-slot="record-layout-header"
      className={cn(
        'flex h-12 shrink-0 items-center gap-2 border-b border-border pr-2 pl-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

export const RecordLayout = Object.assign(RecordLayoutRoot, {
  Aside: RecordLayoutAside,
  Header: RecordLayoutHeader,
  Main: RecordLayoutMain,
  Tabs: RecordLayoutTabs,
  Content: RecordLayoutContent,
  Panel: RecordLayoutPanel,
  Rail: RecordLayoutRail,
})

export { useRecordLayout } from './model/use-record-layout'
export { useRecordLayoutContext } from './context'
export type { PanelAction, RailItem, RecordLayoutLabels } from './types'
export type { RecordLayoutState } from './model/use-record-layout'
