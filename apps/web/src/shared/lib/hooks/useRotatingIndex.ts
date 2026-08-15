'use client'

import { useCallback, useEffect, useState } from 'react'

export interface RotatingIndex {
  readonly index: number
  readonly pause: () => void
  readonly resume: () => void
}

export function useRotatingIndex(length: number, intervalMs: number): RotatingIndex {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [trackedLength, setTrackedLength] = useState(length)

  if (trackedLength !== length) {
    setTrackedLength(length)
    setIndex(0)
  }

  useEffect(() => {
    if (paused || length < 2 || intervalMs <= 0) return

    const id = window.setInterval(() => setIndex((prev) => (prev + 1) % length), intervalMs)
    return () => window.clearInterval(id)
  }, [paused, length, intervalMs])

  const pause = useCallback(() => setPaused(true), [])
  const resume = useCallback(() => setPaused(false), [])

  return { index: length > 0 ? index % length : 0, pause, resume }
}
