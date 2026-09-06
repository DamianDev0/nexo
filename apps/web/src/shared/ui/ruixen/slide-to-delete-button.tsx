'use client'

import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useState } from 'react'

import { cn } from '@/shared/lib'
import { TrashIcon } from '@/shared/ui/icons'

import type { KeyboardEvent } from 'react'

const TRACK_WIDTH = 220
const THUMB_SIZE = 40
const TRACK_PADDING = 3
const MAX_DRAG = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2
const CONFIRM_RATIO = 0.85
const KEYBOARD_SLIDE_SECONDS = 0.35

export type SlideToDeleteButtonProps = {
  readonly label: string
  readonly confirmedLabel: string
  readonly onConfirm: () => void
  readonly className?: string
}

export default function SlideToDeleteButton({
  label,
  confirmedLabel,
  onConfirm,
  className,
}: Readonly<SlideToDeleteButtonProps>) {
  const [confirmed, setConfirmed] = useState(false)
  const x = useMotionValue(0)
  const labelOpacity = useTransform(x, [0, MAX_DRAG * 0.5], [1, 0])
  const fillWidth = useTransform(x, [0, MAX_DRAG], [0, TRACK_WIDTH])

  const confirm = () => {
    setConfirmed(true)
    onConfirm()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    void animate(x, MAX_DRAG, { duration: KEYBOARD_SLIDE_SECONDS }).then(confirm)
  }

  return (
    <div
      data-slot="slide-to-delete"
      className={cn(
        'relative h-11 select-none overflow-hidden rounded-xl border border-border bg-card shadow-xs',
        className,
      )}
      style={{ width: TRACK_WIDTH }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 bg-destructive/10"
        style={{ width: fillWidth }}
      />
      <motion.span
        aria-live="polite"
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] font-medium',
          confirmed ? 'text-destructive' : 'text-muted-foreground',
        )}
        style={{ opacity: confirmed ? 1 : labelOpacity }}
      >
        {confirmed ? confirmedLabel : label}
      </motion.span>
      {!confirmed && (
        <motion.div
          role="button"
          tabIndex={0}
          aria-label={label}
          drag="x"
          dragConstraints={{ left: 0, right: MAX_DRAG }}
          dragElastic={0}
          onDragEnd={() => {
            if (x.get() > MAX_DRAG * CONFIRM_RATIO) confirm()
          }}
          onKeyDown={handleKeyDown}
          className="absolute top-0.75 left-0.75 z-10 flex h-8.5 w-10 cursor-grab items-center justify-center rounded-lg border border-border bg-background text-destructive shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing"
          style={{ x }}
        >
          <TrashIcon className="size-4" />
        </motion.div>
      )}
    </div>
  )
}
