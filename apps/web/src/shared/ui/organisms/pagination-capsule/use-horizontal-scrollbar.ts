'use client'

import { useEffect, useId, useState } from 'react'

import type { RefObject } from 'react'

export function useHorizontalScrollbar(target: RefObject<HTMLElement | null>) {
  const fallbackId = useId()
  const [metrics, setMetrics] = useState({ ratio: 1, offset: 0 })
  const [controlsId, setControlsId] = useState(fallbackId)

  useEffect(() => {
    const el = target.current
    if (!el) return

    if (!el.id) el.id = fallbackId
    setControlsId(el.id)

    const read = () => {
      const ratio = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1
      const scrollable = el.scrollWidth - el.clientWidth
      const offset = scrollable > 0 ? el.scrollLeft / scrollable : 0
      setMetrics((prev) =>
        prev.ratio === ratio && prev.offset === offset ? prev : { ratio, offset },
      )
    }

    read()
    el.addEventListener('scroll', read, { passive: true })
    const observer = new ResizeObserver(read)
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', read)
      observer.disconnect()
    }
  }, [fallbackId, target])

  return { ...metrics, controlsId }
}
