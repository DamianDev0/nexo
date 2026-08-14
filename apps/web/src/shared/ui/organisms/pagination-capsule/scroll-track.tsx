'use client'

import { useRef } from 'react'

import { cn } from '@/shared/lib'

import { useHorizontalScrollbar } from './use-horizontal-scrollbar'

import type { PointerEvent, RefObject } from 'react'

const SEGMENTS = 8

interface DragBounds {
  readonly left: number
  readonly width: number
  readonly scrollable: number
}

export interface ScrollTrackProps {
  readonly target: RefObject<HTMLElement | null>
  readonly label: string
  readonly className?: string
}

export function ScrollTrack({ target, label, className }: Readonly<ScrollTrackProps>) {
  const trackRef = useRef<HTMLDivElement>(null)
  const bounds = useRef<DragBounds | null>(null)
  const { ratio, offset, controlsId } = useHorizontalScrollbar(target)

  const position = ratio >= 1 ? 0 : offset
  const filled = Math.round(position * SEGMENTS)

  const scrollTo = (clientX: number) => {
    const el = target.current
    const box = bounds.current
    if (!el || !box || box.width === 0) return
    const next = (clientX - box.left) / box.width
    el.scrollLeft = Math.min(Math.max(next, 0), 1) * box.scrollable
  }

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    const el = target.current
    if (!track || !el) return
    const rect = track.getBoundingClientRect()
    bounds.current = {
      left: rect.left,
      width: rect.width,
      scrollable: el.scrollWidth - el.clientWidth,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    scrollTo(event.clientX)
  }

  return (
    <div
      ref={trackRef}
      role="scrollbar"
      aria-label={label}
      aria-orientation="horizontal"
      aria-controls={controlsId}
      aria-valuenow={Math.round(position * 100)}
      onPointerDown={startDrag}
      onPointerMove={(event) => {
        if (event.buttons === 1) scrollTo(event.clientX)
      }}
      className={cn(
        'group inline-flex h-7 w-40 cursor-grab touch-none items-center rounded-md bg-muted px-1 active:cursor-grabbing',
        className,
      )}
    >
      <span className="relative h-4.5 w-full">
        <span
          style={{ left: `${position * 100}%`, transform: `translateX(-${position * 100}%)` }}
          className="absolute inset-y-0 inline-flex items-center gap-0.5 rounded-sm bg-card px-1 shadow-xs transition-shadow group-active:shadow-md"
        >
          {Array.from({ length: SEGMENTS }, (_, index) => (
            <span
              key={`segment-${index + 1}`}
              className={cn(
                'h-3 w-1 rounded-xs transition-colors',
                index < filled ? 'bg-primary' : 'bg-muted',
              )}
            />
          ))}
        </span>
      </span>
    </div>
  )
}
