'use client'

import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import * as React from 'react'

import { cn } from '@/shared/lib'

const CARET_SPRING = { stiffness: 500, damping: 30, mass: 0.5 }
const REDUCED_SPRING = { stiffness: 10000, damping: 100, mass: 0.1 }

const NATIVE_CARET_TYPES = new Set([
  'password',
  'email',
  'number',
  'date',
  'time',
  'datetime-local',
  'month',
  'week',
])

function caretIndex(target: HTMLInputElement) {
  const start = target.selectionStart ?? 0
  const end = target.selectionEnd ?? 0
  if (start === end) return start
  return target.selectionDirection === 'backward' ? start : end
}

export function SmoothInput({
  className,
  type,
  style,
  onChange,
  onFocus,
  onBlur,
  ref,
  ...props
}: Readonly<React.ComponentProps<'input'>>) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const measureRef = React.useRef<HTMLSpanElement>(null)
  const detachRef = React.useRef<(() => void) | null>(null)
  const fontSyncedRef = React.useRef(false)
  const caretX = useMotionValue(0)
  const caretOpacity = useMotionValue(0)
  const prefersReducedMotion = useReducedMotion()
  const springCaretX = useSpring(caretX, prefersReducedMotion ? REDUCED_SPRING : CARET_SPRING)

  const updateCaret = React.useCallback(
    (target: HTMLInputElement) => {
      const measure = measureRef.current
      if (!measure) return

      if (NATIVE_CARET_TYPES.has(target.type)) {
        caretOpacity.set(0)
        return
      }

      const styles = window.getComputedStyle(target)
      if (!fontSyncedRef.current) {
        measure.style.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`
        measure.style.letterSpacing = styles.letterSpacing
        measure.style.fontFeatureSettings = styles.fontFeatureSettings
        measure.style.fontVariationSettings = styles.fontVariationSettings
        measure.style.fontKerning = styles.fontKerning
        fontSyncedRef.current = true
      }

      const index = caretIndex(target)
      measure.textContent = target.value.slice(0, index)

      const paddingLeft = parseFloat(styles.paddingLeft) || 0
      const paddingRight = parseFloat(styles.paddingRight) || 0
      const absoluteWidth = index > 0 ? measure.offsetWidth + paddingLeft : paddingLeft - 1

      const position = absoluteWidth - target.scrollLeft
      const maxX = target.clientWidth - paddingRight
      const hasSelection = target.selectionStart !== target.selectionEnd
      const visible = position >= paddingLeft - 1 && position <= maxX + 1

      caretX.set(Math.min(position, maxX) + 1)
      caretOpacity.set(visible && !hasSelection ? 1 : 0)
    },
    [caretX, caretOpacity],
  )

  React.useEffect(() => {
    fontSyncedRef.current = false
    const input = inputRef.current
    if (input && document.activeElement === input) updateCaret(input)
  }, [type, updateCaret])

  const attachCaretListeners = React.useCallback(
    (input: HTMLInputElement) => {
      if (detachRef.current) return
      const updateIfFocused = () => {
        if (document.activeElement !== input) return
        requestAnimationFrame(() => {
          if (document.activeElement === input) updateCaret(input)
        })
      }
      const resyncFont = () => {
        fontSyncedRef.current = false
        updateIfFocused()
      }
      document.addEventListener('selectionchange', updateIfFocused)
      document.fonts?.addEventListener('loadingdone', resyncFont)
      input.addEventListener('scroll', updateIfFocused)
      detachRef.current = () => {
        document.removeEventListener('selectionchange', updateIfFocused)
        document.fonts?.removeEventListener('loadingdone', resyncFont)
        input.removeEventListener('scroll', updateIfFocused)
        detachRef.current = null
      }
    },
    [updateCaret],
  )

  React.useEffect(() => () => detachRef.current?.(), [])

  return (
    <div className="relative w-full min-w-0">
      <input
        type={type}
        data-slot="input"
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
          'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          'autofill:[-webkit-box-shadow:inset_0_0_0_1000px_var(--color-surface-input)] autofill:[-webkit-text-fill-color:var(--color-foreground)]',
          className,
        )}
        style={{
          ...style,
          caretColor: NATIVE_CARET_TYPES.has(type ?? '') ? undefined : 'transparent',
        }}
        onChange={(event) => {
          onChange?.(event)
          const target = event.target
          requestAnimationFrame(() => updateCaret(target))
        }}
        onFocus={(event) => {
          onFocus?.(event)
          const target = event.target
          fontSyncedRef.current = false
          attachCaretListeners(target)
          requestAnimationFrame(() => updateCaret(target))
        }}
        onBlur={(event) => {
          caretOpacity.set(0)
          detachRef.current?.()
          onBlur?.(event)
        }}
        {...props}
      />
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/2 h-[0.95em] w-px -translate-y-1/2 bg-foreground"
        style={{ x: springCaretX, opacity: caretOpacity }}
      />
    </div>
  )
}
