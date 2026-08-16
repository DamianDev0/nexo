'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'

import { cn } from '@/shared/lib'
import { CheckIcon } from '@/shared/ui/icons'

interface AvatarPickerProps {
  readonly avatars: ReadonlyArray<string>
  readonly value: string | null
  readonly label: string
  readonly onChange: (avatar: string) => void
}

const STAGE_TRANSITION = { duration: 0.2, ease: 'easeOut' } as const

export function AvatarPicker({ avatars, value, label, onChange }: Readonly<AvatarPickerProps>) {
  const shouldReduceMotion = useReducedMotion()
  const selected = value ?? avatars[0] ?? null

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-20 overflow-hidden rounded-full bg-muted">
        <AnimatePresence mode="wait">
          {selected && (
            <motion.span
              key={selected}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : STAGE_TRANSITION}
              className="absolute inset-0"
            >
              <Image src={selected} alt={label} fill sizes="80px" className="object-cover" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <ul className="flex max-h-28 w-full flex-wrap justify-center gap-1.5 overflow-y-auto">
        {avatars.map((avatar) => {
          const active = avatar === selected

          return (
            <li key={avatar}>
              <button
                type="button"
                aria-label={label}
                aria-pressed={active}
                onClick={() => onChange(avatar)}
                className={cn(
                  'relative block size-10 overflow-hidden rounded-full transition-[box-shadow,opacity]',
                  active
                    ? 'opacity-100 ring-2 ring-primary ring-offset-2 ring-offset-card'
                    : 'opacity-70 hover:opacity-100',
                )}
              >
                <Image src={avatar} alt="" fill sizes="40px" className="object-cover" />
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center bg-primary/25">
                    <CheckIcon className="size-4 text-primary-foreground" weight="bold" />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
