'use client'

import { motion } from 'motion/react'

import { cn } from '@/shared/lib'
import { fade, slideRight, smoothEase } from '@/shared/lib/animations'

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
  return (
    <AuthLayout>
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
          'relative z-3 flex w-full items-center justify-center overflow-y-auto px-6 py-14 lg:w-130 lg:shrink-0 lg:px-12 xl:w-140',
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
