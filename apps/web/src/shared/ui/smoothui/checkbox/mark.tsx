'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { cn } from '@/shared/lib'
import { SPRING_SNAPPY } from '@/shared/ui/smoothui/lib/animation'

export type CheckboxVisualState = 'checked' | 'unchecked' | 'indeterminate'

export const CHECKBOX_BOX_CLASSES =
  'peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-foreground data-[state=indeterminate]:border-foreground data-[state=checked]:bg-foreground data-[state=indeterminate]:bg-foreground data-[state=unchecked]:bg-background data-[state=checked]:text-background data-[state=indeterminate]:text-background dark:data-[state=unchecked]:bg-input/30 dark:aria-invalid:ring-destructive/40'

const GLYPH_PATHS: Record<'checked' | 'indeterminate', string> = {
  checked: 'M20 6L9 17l-5-5',
  indeterminate: 'M5 12h14',
}

const CheckmarkPath = motion.path
const MotionSvg = motion.svg

export function CheckboxMark({ state }: { readonly state: CheckboxVisualState }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      {state !== 'unchecked' && (
        <MotionSvg
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          className="size-3.5"
          exit={
            shouldReduceMotion
              ? { opacity: 0, transition: { duration: 0 } }
              : { opacity: 0, scale: 0.8 }
          }
          fill="none"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
          key={state}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          transition={shouldReduceMotion ? { duration: 0 } : SPRING_SNAPPY}
          viewBox="0 0 24 24"
        >
          <CheckmarkPath
            animate={shouldReduceMotion ? {} : { pathLength: 1 }}
            d={GLYPH_PATHS[state]}
            initial={shouldReduceMotion ? {} : { pathLength: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : SPRING_SNAPPY}
          />
        </MotionSvg>
      )}
    </AnimatePresence>
  )
}

interface CheckboxGlyphProps {
  readonly checked: boolean
  readonly indeterminate?: boolean
  readonly className?: string
}

export function SmoothCheckboxGlyph({
  checked,
  indeterminate = false,
  className,
}: CheckboxGlyphProps) {
  const state: CheckboxVisualState = indeterminate
    ? 'indeterminate'
    : checked
      ? 'checked'
      : 'unchecked'

  return (
    <span
      aria-hidden
      className={cn(CHECKBOX_BOX_CLASSES, 'grid place-content-center', className)}
      data-slot="checkbox-glyph"
      data-state={state}
    >
      <CheckboxMark state={state} />
    </span>
  )
}
