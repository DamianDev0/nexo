'use client'

import { motion } from 'motion/react'
import { useTheme } from 'next-themes'

import { ORB_GLOW_DARK, ORB_GLOW_LIGHT, SIRI_ORB } from '@/shared/config/tokens/effects'
import { SiriOrb } from '@/shared/ui/atoms/siri-orb'

export function LoginOrb() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-272 -translate-x-1/2 -translate-y-1/2"
        style={{ background: isDark ? ORB_GLOW_DARK : ORB_GLOW_LIGHT }}
      />
      <motion.div
        className="relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' as const }}
      >
        <SiriOrb size={224} colors={isDark ? SIRI_ORB.dark : SIRI_ORB.light} />
      </motion.div>
    </div>
  )
}
