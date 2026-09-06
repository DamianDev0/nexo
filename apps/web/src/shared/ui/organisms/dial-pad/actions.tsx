'use client'

import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/shared/lib'
import { snappySpring } from '@/shared/lib/animations'
import { BackspaceIcon, PhoneIcon } from '@/shared/ui/icons'

import { useDialPad } from './context'

type DialPadCallProps = {
  readonly label: string
  readonly onCall: () => void
  readonly disabled?: boolean
}

export function DialPadCall({ label, onCall, disabled }: Readonly<DialPadCallProps>) {
  return (
    <motion.button
      type="button"
      data-slot="dial-pad-call"
      aria-label={label}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      transition={snappySpring}
      onClick={onCall}
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-pressed',
        'disabled:cursor-not-allowed disabled:opacity-40',
      )}
    >
      <PhoneIcon className="size-4.5" />
    </motion.button>
  )
}

type DialPadBackspaceProps = {
  readonly label: string
  readonly className?: string
}

export function DialPadBackspace({ label, className }: Readonly<DialPadBackspaceProps>) {
  const { value, onDelete } = useDialPad()
  return (
    <AnimatePresence initial={false}>
      {value === '' ? null : (
        <motion.button
          type="button"
          data-slot="dial-pad-backspace"
          aria-label={label}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          whileTap={{ scale: 0.9 }}
          transition={snappySpring}
          onClick={onDelete}
          className={cn(
            'flex size-13 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            className,
          )}
        >
          <BackspaceIcon className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
