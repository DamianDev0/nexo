'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useState } from 'react'

import { cn } from '@/shared/lib'
import { SPRING_DEFAULT } from '@/shared/ui/smoothui/lib/animation'

import type { KeyboardEvent, ReactNode } from 'react'

export interface AnimatedToggleProps {
  checked?: boolean
  className?: string
  defaultChecked?: boolean
  disabled?: boolean
  icons?: { on: ReactNode; off: ReactNode }
  label?: string
  onChange?: (checked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'morph' | 'icon'
}

const SIZES = {
  lg: { icon: 'size-3.5', thumb: 'size-6', thumbTranslate: 24, track: 'w-13 h-7' },
  md: { icon: 'size-3', thumb: 'size-5', thumbTranslate: 20, track: 'w-11 h-6' },
  sm: { icon: 'size-2.5', thumb: 'size-4', thumbTranslate: 16, track: 'w-9 h-5' },
}

export function AnimatedToggle({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  variant = 'default',
  icons,
  size = 'md',
  disabled = false,
  label,
  className,
}: Readonly<AnimatedToggleProps>) {
  const shouldReduceMotion = useReducedMotion()
  const [internalChecked, setInternalChecked] = useState(defaultChecked)

  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : internalChecked

  const handleToggle = useCallback(() => {
    if (disabled) return
    const next = !checked
    if (!isControlled) setInternalChecked(next)
    onChange?.(next)
  }, [checked, disabled, isControlled, onChange])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        handleToggle()
      }
    },
    [handleToggle],
  )

  const sizeConfig = SIZES[size]
  const thumbRadius = variant !== 'morph' || shouldReduceMotion || checked ? 9999 : 6
  const thumbX = checked ? sizeConfig.thumbTranslate : 0

  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked ? 'bg-primary' : 'bg-muted-foreground/30',
        disabled && 'cursor-not-allowed opacity-50',
        sizeConfig.track,
        className,
      )}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      role="switch"
      type="button"
    >
      <motion.span
        animate={shouldReduceMotion ? { x: thumbX } : { borderRadius: thumbRadius, x: thumbX }}
        className={cn(
          'pointer-events-none flex items-center justify-center rounded-full border border-border bg-background shadow-sm',
          sizeConfig.thumb,
        )}
        initial={false}
        style={{ borderRadius: thumbRadius }}
        transition={shouldReduceMotion ? { duration: 0 } : SPRING_DEFAULT}
      >
        {variant === 'icon' && icons && (
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
              className={cn(
                'flex items-center justify-center text-muted-foreground',
                sizeConfig.icon,
              )}
              exit={
                shouldReduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, rotate: -90, scale: 0.5 }
              }
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.5 }}
              key={checked ? 'on' : 'off'}
              transition={shouldReduceMotion ? { duration: 0 } : SPRING_DEFAULT}
            >
              {checked ? icons.on : icons.off}
            </motion.span>
          </AnimatePresence>
        )}
      </motion.span>
    </button>
  )
}
