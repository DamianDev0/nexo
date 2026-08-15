'use client'

import { AnimatePresence, motion } from 'motion/react'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { cn } from '@/shared/lib/cn'
import { useRotatingIndex } from '@/shared/lib/hooks/useRotatingIndex'

interface RotatingTextProps {
  readonly items: ReadonlyArray<string>
  readonly intervalMs: number
  readonly className?: string
}

export function RotatingText({ items, intervalMs, className }: Readonly<RotatingTextProps>) {
  const { index, pause, resume } = useRotatingIndex(items.length, intervalMs)
  const transition = useReducedTransition(quickEase)
  const current = items[index]

  if (current === undefined) return null

  return (
    <span
      onPointerEnter={pause}
      onPointerLeave={resume}
      className={cn('block min-w-0', className)}
      aria-live="polite"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={transition}
          className="block truncate"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
