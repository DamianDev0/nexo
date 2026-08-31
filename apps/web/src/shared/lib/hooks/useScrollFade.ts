'use client'

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

const FADE = '24px'
const EPSILON = 2

function buildMask(left: boolean, right: boolean): string | undefined {
  if (!left && !right) return undefined
  const head = left ? `transparent, black ${FADE}` : 'black'
  const tail = right ? `black calc(100% - ${FADE}), transparent` : 'black'
  return `linear-gradient(to right, ${head}, ${tail})`
}

export function useScrollFade<T extends HTMLElement>(): {
  ref: RefObject<T | null>
  style: CSSProperties
} {
  const ref = useRef<T>(null)
  const [mask, setMask] = useState<string | undefined>(undefined)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const left = el.scrollLeft > EPSILON
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - EPSILON
      setMask(buildMask(left, right))
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  return { ref, style: { maskImage: mask, WebkitMaskImage: mask } }
}
