'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRef } from 'react'

import { quickEase, subtleTween, useReducedTransition } from '@/shared/lib/animations'

import type { ReactNode } from 'react'

const SHIFT = 18

const ENTER = quickEase
const LEAVE = subtleTween

interface PagedTransitionProps {
  readonly page: number
  readonly children: ReactNode
  readonly className?: string
}

export function PagedTransition({ page, children, className }: Readonly<PagedTransitionProps>) {
  const previous = useRef(page)
  const direction = page < previous.current ? -1 : 1
  previous.current = page

  const enter = useReducedTransition(ENTER)
  const leave = useReducedTransition(LEAVE)

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={page}
        initial={{ opacity: 0, x: direction * SHIFT }}
        animate={{ opacity: 1, x: 0, transition: enter }}
        exit={{ opacity: 0, x: direction * -SHIFT, transition: leave }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
