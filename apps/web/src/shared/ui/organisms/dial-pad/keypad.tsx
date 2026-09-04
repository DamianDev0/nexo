'use client'

import { motion } from 'motion/react'

import { cn } from '@/shared/lib'
import { snappySpring } from '@/shared/lib/animations'

import { DIAL_KEYS } from './constants'
import { useDialPad } from './context'

type DialPadKeypadProps = {
  readonly className?: string
}

export function DialPadKeypad({ className }: Readonly<DialPadKeypadProps>) {
  return (
    <div data-slot="dial-pad-keypad" className={cn('grid grid-cols-3 gap-2.5', className)}>
      {DIAL_KEYS.map((key) => (
        <DialPadKey key={key.digit} digit={key.digit} letters={key.letters} />
      ))}
    </div>
  )
}

type DialPadKeyProps = {
  readonly digit: string
  readonly letters: string
}

export function DialPadKey({ digit, letters }: Readonly<DialPadKeyProps>) {
  const { onDigit } = useDialPad()
  return (
    <motion.button
      type="button"
      data-slot="dial-pad-key"
      whileTap={{ scale: 0.9 }}
      transition={snappySpring}
      onClick={() => onDigit(digit)}
      className="flex size-13 flex-col items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
    >
      <span className="text-xl leading-none font-medium tabular-nums">{digit}</span>
      <span className="h-3 text-[10px] font-medium tracking-widest text-muted-foreground">
        {letters}
      </span>
    </motion.button>
  )
}
