'use client'

import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib'
import { playTick } from '@/shared/lib/sound'

import { CarouselRow } from './carousel-row'
import { DRAG_STEP_THRESHOLD, FALLOFF_ROWS, VIEWPORT_HEIGHT, WHEEL_THRESHOLD } from './constants'

import type { CarouselRowItem } from './carousel-row'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

export interface NotificationsCarouselLabels {
  readonly heading: string
  readonly empty: string
  readonly swipeHint: string
}

interface NotificationsCarouselProps {
  readonly items: ReadonlyArray<CarouselRowItem>
  readonly labels: NotificationsCarouselLabels
  readonly footer?: ReactNode
  readonly onDismiss?: (id: string) => void
  readonly onSelect?: (id: string) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

const SURFACE =
  'w-90 overflow-hidden rounded-lg border border-border bg-popover/85 shadow-e2 backdrop-blur-lg'

export function NotificationsCarousel({
  items,
  labels,
  footer,
  onDismiss,
  onSelect,
}: Readonly<NotificationsCarouselProps>) {
  const [index, setIndex] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const wheelAccumulator = useRef(0)
  const dragStartY = useRef(0)
  const dragStartIndex = useRef(0)

  const lastIndex = Math.max(0, items.length - 1)
  const activeIndex = clamp(index, 0, lastIndex)
  const announcedIndex = useRef(activeIndex)

  useEffect(() => {
    if (announcedIndex.current === activeIndex) return
    announcedIndex.current = activeIndex
    playTick()
  }, [activeIndex])

  const goTo = useCallback(
    (next: number) => {
      setIndex(clamp(next, 0, lastIndex))
    },
    [lastIndex],
  )

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      wheelAccumulator.current += event.deltaY
      if (Math.abs(wheelAccumulator.current) < WHEEL_THRESHOLD) return
      const step = Math.sign(wheelAccumulator.current)
      wheelAccumulator.current = 0
      setIndex((current) => clamp(current + step, 0, lastIndex))
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
      if (step === 0) return
      event.preventDefault()
      setIndex((current) => clamp(current + step, 0, lastIndex))
    }

    viewport.addEventListener('wheel', onWheel, { passive: false })
    viewport.addEventListener('keydown', onKeyDown)
    return () => {
      viewport.removeEventListener('wheel', onWheel)
      viewport.removeEventListener('keydown', onKeyDown)
    }
  }, [lastIndex])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      dragStartY.current = event.clientY
      dragStartIndex.current = activeIndex
    },
    [activeIndex],
  )

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const dy = event.clientY - dragStartY.current
      if (Math.abs(dy) <= DRAG_STEP_THRESHOLD) return
      goTo(dragStartIndex.current + (dy < 0 ? 1 : -1))
    },
    [goTo],
  )

  if (items.length === 0) {
    return (
      <div className={SURFACE}>
        <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">{labels.empty}</p>
        {footer}
      </div>
    )
  }

  return (
    <div className={SURFACE}>
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {labels.heading}
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {activeIndex + 1} / {items.length}
        </span>
      </div>

      <div
        ref={viewportRef}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative w-full outline-none [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
        style={{ height: VIEWPORT_HEIGHT }}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, position) => {
            const offset = position - activeIndex
            if (Math.abs(offset) > FALLOFF_ROWS) return null
            return (
              <CarouselRow
                key={item.id}
                item={item}
                offset={offset}
                swipeHint={labels.swipeHint}
                onDismiss={() => onDismiss?.(item.id)}
                onSelect={() => onSelect?.(item.id)}
              />
            )
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-1 px-4 pb-3 pt-2">
        {items.map((item, position) => (
          <button
            key={item.id}
            type="button"
            aria-label={item.title}
            onClick={() => goTo(position)}
            className={cn(
              'h-1 rounded-sm transition-[width,background-color] duration-200',
              position === activeIndex ? 'w-4 bg-foreground/40' : 'w-1 bg-foreground/15',
            )}
          />
        ))}
      </div>

      {footer}
    </div>
  )
}
