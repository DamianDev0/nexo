'use client'

import { motion } from 'motion/react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { useState } from 'react'

import { cn } from '@/shared/lib'

interface AnimatedCheckboxProps {
  readonly id?: string
  readonly checked?: boolean
  readonly defaultChecked?: boolean
  readonly disabled?: boolean
  readonly className?: string
  readonly onCheckedChange?: (checked: boolean) => void
}

const CHECK_PATH = 'M4.5 12.75l6 6 9-13.5'

export function AnimatedCheckbox({
  id,
  checked,
  defaultChecked = false,
  disabled,
  className,
  onCheckedChange,
}: Readonly<AnimatedCheckboxProps>) {
  const [internal, setInternal] = useState(defaultChecked)
  const isChecked = checked ?? internal

  const handleChange = (value: boolean | 'indeterminate') => {
    const next = value === true
    setInternal(next)
    onCheckedChange?.(next)
  }

  return (
    <CheckboxPrimitive.Root
      id={id}
      checked={isChecked}
      onCheckedChange={handleChange}
      disabled={disabled}
      asChild
    >
      <motion.button
        data-slot="animated-checkbox"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className={cn(
          'peer flex size-4 shrink-0 items-center justify-center rounded-sm border border-input outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          className,
        )}
      >
        <CheckboxPrimitive.Indicator forceMount asChild>
          <motion.svg
            data-slot="animated-checkbox-indicator"
            className="size-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3.5"
            stroke="currentColor"
            initial="unchecked"
            animate={isChecked ? 'checked' : 'unchecked'}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={CHECK_PATH}
              variants={{
                checked: {
                  pathLength: 1,
                  opacity: 1,
                  transition: { duration: 0.2, delay: 0.15 },
                },
                unchecked: { pathLength: 0, opacity: 0, transition: { duration: 0.15 } },
              }}
            />
          </motion.svg>
        </CheckboxPrimitive.Indicator>
      </motion.button>
    </CheckboxPrimitive.Root>
  )
}
