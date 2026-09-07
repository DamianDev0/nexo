'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useId } from 'react'

import {
  expandCollapse,
  smoothEase,
  snappySpring,
  useReducedTransition,
} from '@/shared/lib/animations'
import { Text } from '@/shared/ui/atoms/text'
import { CaretRightIcon, PlusIcon } from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { AccordionContext, useAccordionContext } from './context'
import { useAccordion } from './model/use-accordion'

import type { SectionAction, SectionMeta } from './types'
import type { ReactNode } from 'react'

type RecordDrawerSectionsProps = {
  readonly children: ReactNode
  readonly defaultOpen?: readonly string[]
  readonly storageKey?: string
}

export function RecordDrawerSections({
  children,
  defaultOpen,
  storageKey,
}: Readonly<RecordDrawerSectionsProps>) {
  const accordion = useAccordion({ defaultOpen, storageKey })
  return (
    <AccordionContext.Provider value={accordion}>
      <div data-slot="record-drawer-sections" className="flex flex-col divide-y divide-border">
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

type RecordDrawerSectionProps = {
  readonly id: string
  readonly title: string
  readonly children: ReactNode
  readonly meta?: SectionMeta
  readonly action?: SectionAction
}

export function RecordDrawerSection({
  id,
  title,
  children,
  meta,
  action,
}: Readonly<RecordDrawerSectionProps>) {
  const { isOpen, toggle } = useAccordionContext()
  const open = isOpen(id)
  const panelId = useId()
  const chevron = useReducedTransition(snappySpring)
  const reveal = useReducedTransition(smoothEase)

  return (
    <section data-slot="record-drawer-section" data-state={open ? 'open' : 'closed'}>
      <div className="flex items-center gap-1 pr-2 pl-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => toggle(id)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-3.5 pr-2 pl-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <motion.span
            aria-hidden
            animate={{ rotate: open ? 90 : 0 }}
            transition={chevron}
            className="flex shrink-0 text-muted-foreground"
          >
            <CaretRightIcon className="size-4" />
          </motion.span>
          <Text variant="strong" className="truncate text-[15px]">
            {title}
            {meta?.count === undefined ? null : (
              <span className="ml-1 font-medium text-muted-foreground tabular-nums">
                ({meta.count})
              </span>
            )}
          </Text>
          {meta?.badge}
        </button>
        {action ? (
          <HintTooltip asChild hint={action.label}>
            <HeaderIconButton aria-label={action.label} onClick={action.onClick}>
              <PlusIcon />
            </HeaderIconButton>
          </HintTooltip>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            id={panelId}
            variants={expandCollapse}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={reveal}
            className="overflow-hidden"
          >
            <div className="px-4 pt-0.5 pb-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
