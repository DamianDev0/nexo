'use client'

import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/shared/lib'
import { collapseHorizontal, smoothEase, useReducedTransition } from '@/shared/lib/animations'
import { Text } from '@/shared/ui/atoms/text'
import { PlusIcon, XIcon } from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { useRecordLayoutContext } from './context'

import type { PanelAction } from './types'
import type { ReactNode } from 'react'

type RecordLayoutPanelProps = {
  readonly id: string
  readonly title: string
  readonly children: ReactNode
  readonly action?: PanelAction
  readonly closeLabel: string
}

export function RecordLayoutPanel({
  id,
  title,
  children,
  action,
  closeLabel,
}: Readonly<RecordLayoutPanelProps>) {
  const { activePanel, closePanel } = useRecordLayoutContext()
  const transition = useReducedTransition(smoothEase)

  return (
    <AnimatePresence initial={false}>
      {activePanel === id ? (
        <motion.aside
          key={id}
          data-slot="record-layout-panel"
          variants={collapseHorizontal}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="flex shrink-0 flex-col overflow-hidden border-l border-border bg-background"
        >
          <div
            className={cn(
              'flex w-[var(--record-panel-width)] min-w-0 flex-1 flex-col',
              'overflow-hidden',
            )}
          >
            <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border pr-2 pl-4">
              <Text variant="strong" className="min-w-0 flex-1 truncate">
                {title}
              </Text>
              {action ? (
                <HintTooltip asChild hint={action.label}>
                  <HeaderIconButton aria-label={action.label} onClick={action.onClick}>
                    <PlusIcon />
                  </HeaderIconButton>
                </HintTooltip>
              ) : null}
              <HintTooltip asChild hint={closeLabel}>
                <HeaderIconButton aria-label={closeLabel} onClick={closePanel}>
                  <XIcon />
                </HeaderIconButton>
              </HintTooltip>
            </div>
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]">
              {children}
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
