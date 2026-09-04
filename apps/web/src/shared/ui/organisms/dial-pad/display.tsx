'use client'

import { motion } from 'motion/react'

import { cn } from '@/shared/lib'
import { quickEase } from '@/shared/lib/animations'

import { useDialPad } from './context'

type DialPadDisplayProps = {
  readonly placeholder: string
  readonly className?: string
}

export function DialPadDisplay({ placeholder, className }: Readonly<DialPadDisplayProps>) {
  const { value } = useDialPad()
  const empty = value === ''
  return (
    <output
      data-slot="dial-pad-display"
      aria-live="polite"
      className={cn(
        'flex h-12 w-full items-center justify-center overflow-hidden text-center whitespace-nowrap',
        empty ? 'text-base text-muted-foreground/60' : 'text-2xl font-semibold text-foreground',
        className,
      )}
    >
      <motion.span
        key={value}
        initial={{ scale: 0.97, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={quickEase}
        className="tabular-nums tracking-wide"
      >
        {empty ? placeholder : value}
      </motion.span>
    </output>
  )
}
