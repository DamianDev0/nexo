'use client'

import { useReducedMotion } from 'motion/react'
import { useEffect } from 'react'

import { SMART_LIST_TAB_SELECTOR, SMART_LIST_TRACK_SELECTOR } from '../config/smart-list.constants'

import type { RefObject } from 'react'

export function useSmartListReveal(
  ref: RefObject<HTMLDivElement | null>,
  activeId: string,
  pinnedWidth: number,
) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    const track = el?.querySelector<HTMLElement>(SMART_LIST_TRACK_SELECTOR)
    const tab = track?.querySelector<HTMLElement>(`[${SMART_LIST_TAB_SELECTOR}="${activeId}"]`)
    if (!el || !track || !tab) return

    const origin = track.getBoundingClientRect().left
    const bounds = tab.getBoundingClientRect()
    const start = bounds.left - origin
    const end = bounds.right - origin
    const behavior = reduceMotion ? 'auto' : 'smooth'

    if (start < el.scrollLeft + pinnedWidth) {
      el.scrollTo({ left: Math.max(start - pinnedWidth, 0), behavior })
      return
    }

    if (end > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: end - el.clientWidth, behavior })
    }
  }, [activeId, pinnedWidth, reduceMotion, ref])
}
