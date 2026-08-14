'use client'

import { motion } from 'motion/react'
import { useCallback, useRef } from 'react'

import { cn } from '@/shared/lib/cn'
import { CaretLeftIcon, CaretRightIcon } from '@/shared/ui/icons'

import type { PointerEvent } from 'react'

const DOT_STEP = 14
const MORPH_SPRING = { type: 'spring' as const, stiffness: 500, damping: 30 }

interface MorphingPageDotsProps {
  readonly total: number
  readonly page: number
  readonly onPageChange: (page: number) => void
  readonly label: string
  readonly className?: string
}

export function MorphingPageDots({
  total,
  page,
  onPageChange,
  label,
  className,
}: Readonly<MorphingPageDotsProps>) {
  const dragging = useRef(false)
  const startX = useRef(0)
  const startPage = useRef(page)

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 1), total)
      if (clamped !== page) onPageChange(clamped)
    },
    [onPageChange, page, total],
  )

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
      dragging.current = true
      startX.current = event.clientX
      startPage.current = page
    },
    [page],
  )

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return
      go(startPage.current + Math.round((event.clientX - startX.current) / DOT_STEP))
    },
    [go],
  )

  const handlePointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  if (total <= 1) return null

  return (
    <nav aria-label={label} className={cn('flex justify-center', className)}>
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-popover/80 px-3 py-2 shadow-sm backdrop-blur-xl">
        <button
          type="button"
          aria-label={`${label} ${page - 1}`}
          disabled={page === 1}
          onClick={() => go(page - 1)}
          className="flex p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <CaretLeftIcon className="size-3" />
        </button>

        <div
          className="flex cursor-grab touch-none items-center gap-1.5 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
        >
          {Array.from({ length: total }, (_, index) => {
            const target = index + 1
            const isActive = target === page

            return (
              <button
                key={target}
                type="button"
                aria-label={`${label} ${target}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => go(target)}
                className="flex h-5 items-center"
              >
                <motion.span
                  animate={{ width: isActive ? 28 : 8 }}
                  transition={MORPH_SPRING}
                  className={cn(
                    'h-2 rounded-full transition-colors',
                    isActive ? 'bg-primary' : 'bg-foreground/15 hover:bg-foreground/30',
                  )}
                />
              </button>
            )
          })}
        </div>

        <button
          type="button"
          aria-label={`${label} ${page + 1}`}
          disabled={page === total}
          onClick={() => go(page + 1)}
          className="flex p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <CaretRightIcon className="size-3" />
        </button>
      </div>
    </nav>
  )
}
