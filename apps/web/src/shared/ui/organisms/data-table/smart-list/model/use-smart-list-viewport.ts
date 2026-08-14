'use client'

import { useEffect, useRef, useState } from 'react'

import {
  SMART_LIST_FADE_WIDTH as FADE,
  SMART_LIST_MAX_VISIBLE,
  SMART_LIST_SCROLL_EPSILON as EPSILON,
  SMART_LIST_TRACK_SELECTOR,
} from '../config/smart-list.constants'

interface Edges {
  readonly left: boolean
  readonly right: boolean
}

interface Layout {
  readonly maxWidth?: number
  readonly pinnedWidth: number
}

const NO_EDGES: Edges = { left: false, right: false }
const NO_LAYOUT: Layout = { pinnedWidth: 0 }

function buildMask(left: boolean, right: boolean): string | undefined {
  if (!left && !right) return undefined
  const head = left ? `transparent, black ${FADE}` : 'black'
  const tail = right ? `black calc(100% - ${FADE}), transparent` : 'black'
  return `linear-gradient(to right, ${head}, ${tail})`
}

function readEdges(el: HTMLElement): Edges {
  return {
    left: el.scrollLeft > EPSILON,
    right: el.scrollLeft + el.clientWidth < el.scrollWidth - EPSILON,
  }
}

function readLayout(track: HTMLElement | null): Layout {
  const tabs = track ? ([...track.children] as HTMLElement[]) : []
  const first = tabs[0]
  if (!first) return NO_LAYOUT

  const origin = first.offsetLeft
  const boundary = tabs[SMART_LIST_MAX_VISIBLE]
  const cap = boundary ? boundary.offsetLeft - origin : 0
  const pinned = tabs.filter((tab) => tab.dataset.pinned === 'true')
  const lastPinned = pinned.at(-1)

  return {
    maxWidth: cap > 0 ? cap : undefined,
    pinnedWidth: lastPinned ? lastPinned.offsetLeft + lastPinned.offsetWidth - origin : 0,
  }
}

export function useSmartListViewport(count: number, hasPinned = false) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState<Edges>(NO_EDGES)
  const [layout, setLayout] = useState<Layout>(NO_LAYOUT)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const track = el.querySelector<HTMLElement>(SMART_LIST_TRACK_SELECTOR)

    const syncEdges = () =>
      setEdges((prev) => {
        const next = readEdges(el)
        return prev.left === next.left && prev.right === next.right ? prev : next
      })

    const syncLayout = () => {
      setLayout((prev) => {
        const next = readLayout(track)
        return prev.maxWidth === next.maxWidth && prev.pinnedWidth === next.pinnedWidth
          ? prev
          : next
      })
      syncEdges()
    }

    syncLayout()
    el.addEventListener('scroll', syncEdges, { passive: true })

    const observer = new ResizeObserver(syncLayout)
    observer.observe(el)
    if (track) observer.observe(track)

    return () => {
      el.removeEventListener('scroll', syncEdges)
      observer.disconnect()
    }
  }, [count])

  const maskImage = buildMask(edges.left && !hasPinned, edges.right)

  return {
    ref,
    pinnedWidth: layout.pinnedWidth,
    style: { maskImage, WebkitMaskImage: maskImage, maxWidth: layout.maxWidth },
  }
}
