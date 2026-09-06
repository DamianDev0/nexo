'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

type DragOffset = { readonly x: number; readonly y: number }

type DragOrigin = {
  readonly pointerX: number
  readonly pointerY: number
  readonly offset: DragOffset
}

const restingOffset: DragOffset = { x: 0, y: 0 }

const dragThresholdPx = 4

const viewportMarginPx = 8

export function useDraggable() {
  const [offset, setOffset] = useState<DragOffset>(restingOffset)
  const [dragging, setDragging] = useState(false)
  const origin = useRef<DragOrigin | null>(null)
  const moved = useRef(false)
  const offsetRef = useRef<DragOffset>(restingOffset)
  const elementRef = useRef<HTMLDivElement | null>(null)

  const clampOffset = useCallback((next: DragOffset): DragOffset => {
    const element = elementRef.current
    if (!element) return next
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return next
    const current = offsetRef.current
    const baseLeft = rect.left - current.x
    const baseTop = rect.top - current.y
    const minX = viewportMarginPx - baseLeft
    const maxX = window.innerWidth - viewportMarginPx - rect.width - baseLeft
    const minY = viewportMarginPx - baseTop
    const maxY = window.innerHeight - viewportMarginPx - rect.height - baseTop
    return {
      x: Math.min(Math.max(next.x, minX), Math.max(maxX, minX)),
      y: Math.min(Math.max(next.y, minY), Math.max(maxY, minY)),
    }
  }, [])

  const applyOffset = useCallback(
    (next: DragOffset) => {
      const clamped = clampOffset(next)
      offsetRef.current = clamped
      setOffset(clamped)
    },
    [clampOffset],
  )

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return
      if (event.target instanceof HTMLElement) {
        const button = event.target.closest('button')
        if (button && button.dataset.dragHandle === undefined) return
      }
      event.preventDefault()
      origin.current = { pointerX: event.clientX, pointerY: event.clientY, offset }
      moved.current = false
      setDragging(true)
    },
    [offset],
  )

  useEffect(() => {
    if (!dragging) return
    const onMove = (event: PointerEvent) => {
      const start = origin.current
      if (!start) return
      const deltaX = event.clientX - start.pointerX
      const deltaY = event.clientY - start.pointerY
      if (Math.abs(deltaX) + Math.abs(deltaY) > dragThresholdPx) moved.current = true
      applyOffset({ x: start.offset.x + deltaX, y: start.offset.y + deltaY })
    }
    const onUp = () => {
      origin.current = null
      setDragging(false)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging, applyOffset])

  const ensureInViewport = useCallback(() => {
    const run = () => applyOffset(offsetRef.current)
    requestAnimationFrame(run)
    setTimeout(run, 200)
  }, [applyOffset])

  const consumeMoved = useCallback(() => {
    const wasMoved = moved.current
    moved.current = false
    return wasMoved
  }, [])

  const style: CSSProperties = { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }

  return {
    dragging,
    style,
    elementRef,
    consumeMoved,
    ensureInViewport,
    handleProps: { onPointerDown, style: { touchAction: 'none' } as CSSProperties },
  }
}
