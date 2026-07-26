'use client'

import { motion } from 'motion/react'
import { useTheme } from 'next-themes'

import { PANEL_GLOW_LIGHT, PANEL_GLOW_DARK } from '@/shared/config/tokens/effects'
import { cn } from '@/shared/lib'
import { fade, slideRight, smoothEase } from '@/shared/lib/animations'
import { useMounted } from '@/shared/lib/hooks/useMounted'

import { AuthLayout } from './AuthLayout'

import type { ReactNode } from 'react'

interface AuthSplitViewProps {
  readonly branding: ReactNode
  readonly children: ReactNode
  readonly brandingClassName?: string
  readonly contentClassName?: string
  readonly innerClassName?: string
}

export function AuthSplitView({
  branding,
  children,
  brandingClassName,
  contentClassName,
  innerClassName,
}: Readonly<AuthSplitViewProps>) {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <AuthLayout>
      {mounted && (
        <div
          className="pointer-events-none absolute right-0 top-1/2 z-1 hidden h-4/5 w-96 -translate-y-1/2 lg:block"
          style={{ background: isDark ? PANEL_GLOW_DARK : PANEL_GLOW_LIGHT }}
        />
      )}

      <motion.div
        initial="initial"
        animate="animate"
        variants={fade}
        transition={smoothEase}
        className={cn('hidden flex-1 lg:flex', brandingClassName)}
      >
        {branding}
      </motion.div>

      <div
        className={cn(
          'relative z-3 flex w-full justify-center overflow-y-auto px-6 pb-14 pt-16 lg:w-130 lg:shrink-0 lg:px-12 lg:pt-24 xl:w-140',
          contentClassName,
        )}
      >
        <motion.div
          initial="initial"
          animate="animate"
          variants={slideRight}
          transition={smoothEase}
          className={cn('flex w-full max-w-md flex-col', innerClassName)}
        >
          {children}
        </motion.div>
      </div>
    </AuthLayout>
  )
}
