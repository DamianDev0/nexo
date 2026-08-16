'use client'

import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/shared/lib'
import { CheckIcon, PencilSimpleIcon, UserIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

interface AvatarPickerProps {
  readonly avatars: ReadonlyArray<string>
  readonly value: string | null
  readonly labels: { readonly trigger: string; readonly title: string }
  readonly onChange: (avatar: string) => void
}

export function AvatarPicker({ avatars, value, labels, onChange }: Readonly<AvatarPickerProps>) {
  const [open, setOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={labels.trigger}
          data-slot="avatar-trigger"
          className="group/avatar relative size-16 shrink-0 rounded-full p-0 hover:bg-transparent"
        >
          <span className="relative block size-16 overflow-hidden rounded-full border border-border bg-muted">
            {value ? (
              <Image src={value} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-faint">
                <UserIcon className="size-6" />
              </span>
            )}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full border border-border bg-card text-body shadow-xs">
            <PencilSimpleIcon className="size-3" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 p-3">
        <p className="pb-2 text-xs font-medium text-muted-foreground">{labels.title}</p>
        <ul className="grid max-h-56 grid-cols-5 gap-2 overflow-y-auto">
          {avatars.map((avatar) => {
            const active = avatar === value

            return (
              <li key={avatar}>
                <motion.button
                  type="button"
                  aria-label={labels.trigger}
                  aria-pressed={active}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
                  onClick={() => {
                    onChange(avatar)
                    setOpen(false)
                  }}
                  className={cn(
                    'relative block size-11 overflow-hidden rounded-full transition-opacity',
                    active
                      ? 'opacity-100 ring-2 ring-primary ring-offset-2 ring-offset-popover'
                      : 'opacity-75 hover:opacity-100',
                  )}
                >
                  <Image src={avatar} alt="" fill sizes="44px" className="object-cover" />
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary/30">
                      <CheckIcon className="size-4 text-primary-foreground" weight="bold" />
                    </span>
                  )}
                </motion.button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
