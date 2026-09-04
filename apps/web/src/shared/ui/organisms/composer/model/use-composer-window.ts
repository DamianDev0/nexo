'use client'

import { useDragControls, useMotionValue } from 'motion/react'
import { useCallback, useMemo, useRef, useState } from 'react'

import type { PointerEvent } from 'react'

const DRAG_CLICK_TOLERANCE_PX = 4

export function useComposerWindow() {
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const dragControls = useDragControls()
  const constraintsRef = useRef<HTMLDivElement | null>(null)
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const wasDragged = useCallback(() => {
    const origin = dragOriginRef.current
    if (!origin) return false
    return Math.abs(x.get() - origin.x) + Math.abs(y.get() - origin.y) > DRAG_CLICK_TOLERANCE_PX
  }, [x, y])

  const toggleMinimized = useCallback(() => {
    setMaximized(false)
    setMinimized((current) => !current)
  }, [])

  const toggleMaximized = useCallback(() => {
    x.set(0)
    y.set(0)
    setMinimized(false)
    setMaximized((current) => !current)
  }, [x, y])

  const startDrag = useCallback(
    (event: PointerEvent) => {
      event.preventDefault()
      dragOriginRef.current = { x: x.get(), y: y.get() }
      dragControls.start(event)
    },
    [dragControls, x, y],
  )

  return useMemo(
    () => ({
      minimized,
      maximized,
      toggleMinimized,
      toggleMaximized,
      dragControls,
      constraintsRef,
      x,
      y,
      startDrag,
      wasDragged,
    }),
    [
      minimized,
      maximized,
      toggleMinimized,
      toggleMaximized,
      dragControls,
      x,
      y,
      startDrag,
      wasDragged,
    ],
  )
}

export type ComposerWindow = ReturnType<typeof useComposerWindow>
