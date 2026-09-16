'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRef } from 'react'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { cn } from '@/shared/lib/cn'

import type { ReactNode } from 'react'

const SHIFT = 10

type SwapTextProps = {
  readonly id: number | string
  readonly children: ReactNode
  readonly className?: string
}

export function SwapText({ id, children, className }: Readonly<SwapTextProps>) {
  const transition = useReducedTransition(quickEase)
  const previous = useRef(id)
  const direction =
    typeof id === 'number' && typeof previous.current === 'number' && id < previous.current ? -1 : 1
  previous.current = id

  return (
    <span className={cn('relative inline-grid overflow-hidden', className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={id}
          initial={{ opacity: 0, y: SHIFT * direction }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -SHIFT * direction }}
          transition={transition}
          className="col-start-1 row-start-1 whitespace-nowrap"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
