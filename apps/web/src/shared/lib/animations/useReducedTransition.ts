'use client'

import { useReducedMotion } from 'motion/react'

import { instant } from './variants'

export function useReducedTransition<T extends object>(transition: T): T | typeof instant {
  const shouldReduce = useReducedMotion()
  return shouldReduce ? instant : transition
}
