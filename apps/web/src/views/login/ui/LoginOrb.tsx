'use client'

import { motion } from 'motion/react'
import { useTheme } from 'next-themes'

import { SIRI_ORB } from '@/shared/config/tokens/effects'
import { SiriOrb } from '@/shared/ui/atoms/siri-orb'

export function LoginOrb() {
  const { resolvedTheme } = useTheme()
  const palette = resolvedTheme === 'dark' ? SIRI_ORB.dark : SIRI_ORB.light

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' as const }}
    >
      <SiriOrb size={224} colors={palette} />
    </motion.div>
  )
}
