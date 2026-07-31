'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const CLOSE_DELAY_MS = 140

export function useHoverDisclosure(closeDelayMs = CLOSE_DELAY_MS) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }, [])

  useEffect(() => cancel, [cancel])

  const onMouseEnter = useCallback(() => {
    cancel()
    setOpen(true)
  }, [cancel])

  const onMouseLeave = useCallback(() => {
    cancel()
    timer.current = setTimeout(() => setOpen(false), closeDelayMs)
  }, [cancel, closeDelayMs])

  return { open, setOpen, hoverProps: { onMouseEnter, onMouseLeave } }
}
