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
    <div
      data-slot="dial-pad-keypad"
      className={cn('grid grid-cols-3 gap-x-5 gap-y-1.5', className)}
    >
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

function DialPadKey({ digit, letters }: Readonly<DialPadKeyProps>) {
  const { onDigit } = useDialPad()
  return (
    <motion.button
      type="button"
      data-slot="dial-pad-key"
      whileTap={{ scale: 0.92 }}
      transition={snappySpring}
      onClick={() => onDigit(digit)}
      className="flex size-12 flex-col items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted active:bg-accent"
    >
      <span
        data-slot="dial-pad-digit"
        className={cn(
          'leading-none font-normal tabular-nums',
          digit === '*' ? 'translate-y-1 text-3xl' : 'text-xl',
        )}
      >
        {digit}
      </span>
      {letters === '' ? null : (
        <span
          data-slot="dial-pad-letters"
          className="h-2 text-[7px] tracking-wide text-muted-foreground"
        >
          {letters}
        </span>
      )}
    </motion.button>
  )
}
