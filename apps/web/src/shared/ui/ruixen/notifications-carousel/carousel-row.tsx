'use client'

import { animate, motion } from 'motion/react'
import { useCallback, useRef } from 'react'

import { cn } from '@/shared/lib/index'

import {
  DISMISS_THRESHOLD,
  FALLOFF_ROWS,
  FLING_DISTANCE,
  FLING_SPRING,
  ROW_HEIGHT,
  ROW_SPRING,
  ROW_STEP,
  SNAP_SPRING,
  VIEWPORT_HEIGHT,
  ZONE_MAX_OPACITY,
} from './constants'

import type { PointerEvent as ReactPointerEvent } from 'react'

export interface CarouselRowItem {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly time: string
  readonly unread?: boolean
}

interface CarouselRowProps {
  readonly item: CarouselRowItem
  readonly offset: number
  readonly swipeHint: string
  readonly onDismiss: () => void
  readonly onSelect: () => void
}

const TAP_TOLERANCE = 3
const ZONE_DEAD_ZONE = 10

export function CarouselRow({ item, offset, swipeHint, onDismiss, onSelect }: CarouselRowProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const zoneRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const deltaX = useRef(0)
  const dragging = useRef(false)

  const isFocused = offset === 0
  const proximity = Math.max(0, 1 - Math.abs(offset) / FALLOFF_ROWS)
  const y = VIEWPORT_HEIGHT / 2 - ROW_HEIGHT / 2 + offset * ROW_STEP

  const paintZone = useCallback((dx: number) => {
    const zone = zoneRef.current
    if (!zone) return
    const direction = dx < -ZONE_DEAD_ZONE ? 'dismiss' : dx > ZONE_DEAD_ZONE ? 'read' : 'idle'
    const intensity = Math.min(1, Math.abs(dx) / (DISMISS_THRESHOLD * 1.5))
    zone.dataset.direction = direction
    zone.style.opacity = direction === 'idle' ? '0' : `${intensity * ZONE_MAX_OPACITY}`
  }, [])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isFocused) return
      event.stopPropagation()
      event.currentTarget.setPointerCapture(event.pointerId)
      startX.current = event.clientX
      deltaX.current = 0
      dragging.current = true
    },
    [isFocused],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return
      const dx = event.clientX - startX.current
      deltaX.current = dx
      if (cardRef.current) cardRef.current.style.transform = `translateX(${dx}px)`
      paintZone(dx)
    },
    [paintZone],
  )

  const handlePointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false

    const dx = deltaX.current
    const card = cardRef.current

    if (Math.abs(dx) > DISMISS_THRESHOLD) {
      if (!card) {
        onDismiss()
        return
      }
      animate(dx, Math.sign(dx) * FLING_DISTANCE, {
        ...FLING_SPRING,
        onUpdate: (value) => {
          card.style.transform = `translateX(${value}px)`
          card.style.opacity = `${1 - Math.abs(value) / FLING_DISTANCE}`
        },
        onComplete: onDismiss,
      })
      return
    }

    if (card) {
      animate(dx, 0, {
        ...SNAP_SPRING,
        onUpdate: (value) => {
          card.style.transform = `translateX(${value}px)`
        },
      })
    }
    paintZone(0)
    if (Math.abs(dx) < TAP_TOLERANCE) onSelect()
  }, [onDismiss, onSelect, paintZone])

  return (
    <motion.div
      initial={{ opacity: 0, y: y + 20 }}
      animate={{ opacity: 1, y }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={ROW_SPRING}
      className="absolute inset-x-3"
      style={{ height: ROW_HEIGHT }}
    >
      <div
        ref={zoneRef}
        data-direction="idle"
        className="pointer-events-none absolute inset-0 rounded-md opacity-0 transition-colors duration-75 data-[direction=dismiss]:bg-destructive data-[direction=read]:bg-positive"
      />

      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
        className={cn(
          'relative flex h-full touch-none flex-col justify-center gap-0.5 rounded-md border px-3.5 py-3 transition-[background-color,border-color,box-shadow,filter] duration-150 will-change-transform',
          isFocused
            ? 'cursor-grab border-border bg-muted/70 shadow-e2 active:cursor-grabbing'
            : 'border-transparent bg-muted/25',
        )}
        style={{
          opacity: 0.3 + proximity * 0.7,
          filter: `blur(${(1 - proximity) * 0.8}px)`,
        }}
      >
        <div className="flex items-center gap-2">
          {item.unread ? <span className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
          <span className="flex-1 truncate text-[13px] font-medium tracking-tight text-foreground">
            {item.title}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {item.time}
          </span>
        </div>
        <span className="truncate text-xs text-muted-foreground">{item.body}</span>
        {isFocused ? (
          <span className="absolute bottom-1.5 right-3.5 text-[9px] text-muted-foreground/50">
            {swipeHint}
          </span>
        ) : null}
      </div>
    </motion.div>
  )
}
