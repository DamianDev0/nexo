'use client'

import { motion, useReducedMotion } from 'motion/react'

import { avatarGradient, cn } from '@/shared/lib'

import type { Transition } from 'motion/react'

const DRIFT = {
  scale: [1, 1.25, 1.1, 1],
  x: ['-6%', '8%', '-4%', '-6%'],
  y: ['5%', '-8%', '7%', '5%'],
}

const DRIFT_TRANSITION: Transition = {
  duration: 18,
  repeat: Number.POSITIVE_INFINITY,
  ease: 'easeInOut',
  times: [0, 0.35, 0.7, 1],
}

interface AvatarGradientProps {
  readonly seed: string
  readonly className?: string
}

export function AvatarGradient({ seed, className }: Readonly<AvatarGradientProps>) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.span
      aria-hidden
      className={cn('absolute inset-[-30%] will-change-transform', avatarGradient(seed), className)}
      animate={shouldReduce ? undefined : DRIFT}
      transition={DRIFT_TRANSITION}
    />
  )
}
