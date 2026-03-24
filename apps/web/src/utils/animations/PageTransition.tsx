'use client'

import { motion, type Variants } from 'motion/react'
import { fadeSlideUp, smoothEase } from './variants'

interface PageTransitionProps {
  readonly children: React.ReactNode
  readonly className?: string
  readonly variants?: Variants
  readonly transition?: Record<string, unknown>
}

export function PageTransition({
  children,
  className,
  variants = fadeSlideUp,
  transition = smoothEase,
}: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}
