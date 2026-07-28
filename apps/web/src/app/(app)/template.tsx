'use client'

import { motion, MotionConfig } from 'motion/react'

import type { ReactNode } from 'react'

export default function AppTemplate({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="h-full"
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}
