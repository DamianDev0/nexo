'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRef } from 'react'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { Text } from '@/shared/ui/atoms/text'
import { CaretLeftIcon, CaretRightIcon, XIcon } from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import type { RecordDrawerLabels, RecordPager } from './types'

const COUNTER_SHIFT = 6

function PagerControls({
  pager,
  labels,
}: Readonly<{ pager: RecordPager; labels: RecordDrawerLabels }>) {
  const transition = useReducedTransition(quickEase)
  const previous = useRef(pager.index)
  const direction = useRef(1)
  if (previous.current !== pager.index) {
    direction.current = pager.index < previous.current ? -1 : 1
    previous.current = pager.index
  }

  return (
    <span className="flex items-center gap-0.5">
      <HintTooltip asChild hint={labels.prev}>
        <HeaderIconButton aria-label={labels.prev} disabled={!pager.hasPrev} onClick={pager.prev}>
          <CaretLeftIcon />
        </HeaderIconButton>
      </HintTooltip>
      <span
        aria-live="polite"
        className="relative flex h-6 min-w-10 items-center justify-center overflow-hidden"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={pager.index}
            initial={{ opacity: 0, y: direction.current * COUNTER_SHIFT }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction.current * -COUNTER_SHIFT }}
            transition={transition}
          >
            <Text variant="strong" className="tabular-nums">
              {pager.index + 1}/{pager.total}
            </Text>
          </motion.span>
        </AnimatePresence>
      </span>
      <HintTooltip asChild hint={labels.next}>
        <HeaderIconButton aria-label={labels.next} disabled={!pager.hasNext} onClick={pager.next}>
          <CaretRightIcon />
        </HeaderIconButton>
      </HintTooltip>
    </span>
  )
}

type RecordDrawerHeaderProps = {
  readonly labels: RecordDrawerLabels
  readonly onClose: () => void
  readonly pager?: RecordPager | null
}

export function RecordDrawerHeader({ labels, onClose, pager }: Readonly<RecordDrawerHeaderProps>) {
  return (
    <div
      data-slot="record-drawer-header"
      className="flex h-12 shrink-0 items-center gap-2 border-b border-border pr-2 pl-4"
    >
      <Text variant="muted" className="min-w-0 flex-1 truncate">
        {labels.title}
      </Text>
      {pager ? <PagerControls pager={pager} labels={labels} /> : null}
      <span className="flex flex-1 justify-end">
        <HeaderIconButton
          aria-label={labels.close}
          onClick={onClose}
          className="rounded-lg border border-border"
        >
          <XIcon />
        </HeaderIconButton>
      </span>
    </div>
  )
}
