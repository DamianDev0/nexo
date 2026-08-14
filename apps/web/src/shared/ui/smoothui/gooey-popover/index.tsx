'use client'

import gsap from 'gsap'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/index'

import { useClickOutside } from './use-click-outside'

const DEFAULT_CONTENT_WIDTH = 240
const DEFAULT_SIDE_OFFSET = 24
const DEFAULT_SPEED = 0.25
const GOO_STD_DEVIATION = 10
const GOO_MATRIX_ALPHA_MULTIPLIER = 24
const GOO_MATRIX_ALPHA_OFFSET = -10
const DEFAULT_CONTENT_RADIUS = 18
const OFFSCREEN = -9999

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

type Size = { width: number; height: number }

const EMPTY_SIZE: Size = { width: 0, height: 0 }

function useObservedSize(ref: React.RefObject<HTMLElement | null>, enabled: boolean): Size {
  const [size, setSize] = useState<Size>(EMPTY_SIZE)

  useIsoLayoutEffect(() => {
    const element = ref.current
    if (!element || !enabled) return

    const measure = () => {
      setSize({ width: element.offsetWidth, height: element.offsetHeight })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, enabled])

  return size
}

export type GooeyPopoverProps = {
  children: React.ReactNode
  trigger?: React.ReactNode
  triggerSize?: number
  triggerRadius?: number
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  contentWidth?: number
  contentRadius?: number
  speed?: number
  bgClassName?: string
  triggerClassName?: string
  surfaceClassName?: string
  contentClassName?: string
  className?: string
}

export default function GooeyPopover({
  children,
  trigger,
  triggerSize,
  triggerRadius,
  isOpen: controlledIsOpen,
  onOpenChange,
  side = 'top',
  align = 'center',
  sideOffset = DEFAULT_SIDE_OFFSET,
  contentWidth = DEFAULT_CONTENT_WIDTH,
  contentRadius = DEFAULT_CONTENT_RADIUS,
  speed = DEFAULT_SPEED,
  bgClassName = 'bg-popover',
  triggerClassName,
  surfaceClassName,
  contentClassName,
  className,
}: GooeyPopoverProps) {
  const filterId = useId()
  const isControlled = controlledIsOpen !== undefined
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen
  const [isVisible, setIsVisible] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const filteredContentRef = useRef<HTMLDivElement>(null)
  const innerContentRef = useRef<HTMLDivElement>(null)
  const [panelNode, setPanelNode] = useState<HTMLDivElement | null>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const showOverlay = isOpen || isVisible
  const isFixedSquare = triggerSize !== undefined
  const measuredTrigger = useObservedSize(triggerRef, !isFixedSquare)
  const measuredContent = useObservedSize(measureRef, true)

  const triggerWidth = isFixedSquare ? triggerSize : measuredTrigger.width
  const triggerHeight = isFixedSquare ? triggerSize : measuredTrigger.height
  const contentHeight = measuredContent.height
  const radius = triggerRadius ?? Math.min(triggerWidth, triggerHeight) / 2

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(query.matches)
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (!isControlled) setInternalIsOpen(open)
      onOpenChange?.(open)
    },
    [isControlled, onOpenChange],
  )

  const handleClose = useCallback(() => {
    if (isOpen) setIsOpen(false)
  }, [isOpen, setIsOpen])

  useClickOutside(containerRef, handleClose)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setIsOpen])

  const translateY = side === 'top' ? -(contentHeight + sideOffset) : triggerHeight + sideOffset
  const centeredLeft = triggerWidth / 2 - contentWidth / 2
  const contentLeft =
    align === 'start' ? 0 : align === 'end' ? triggerWidth - contentWidth : centeredLeft

  useEffect(() => {
    if (contentHeight === 0 || triggerHeight === 0) return

    timelineRef.current?.kill()

    const filteredTarget = filteredContentRef.current
    const unfilteredTarget = panelNode
    const innerTarget = innerContentRef.current
    if (!(unfilteredTarget && innerTarget)) return

    const collapsed = {
      width: triggerWidth,
      height: triggerHeight,
      borderRadius: radius,
      x: 0,
      y: 0,
    }
    const expanded = {
      width: contentWidth,
      height: contentHeight,
      borderRadius: contentRadius,
      x: contentLeft,
      y: translateY,
    }

    if (prefersReducedMotion) {
      gsap.set(unfilteredTarget, { ...(isOpen ? expanded : collapsed), opacity: isOpen ? 1 : 0 })
      gsap.set(innerTarget, { opacity: isOpen ? 1 : 0, y: 0 })
      setIsVisible(isOpen)
      return
    }

    if (isOpen) {
      setIsVisible(true)

      const startProps = { ...collapsed, opacity: 1 }
      if (filteredTarget) gsap.set(filteredTarget, startProps)
      gsap.set(unfilteredTarget, startProps)
      gsap.set(innerTarget, { opacity: 0, y: 16 })

      const timeline = gsap.timeline()

      if (filteredTarget) {
        timeline.to(
          filteredTarget,
          { ...expanded, borderRadius: 0, duration: speed, ease: 'power1.in' },
          0,
        )
      }
      timeline.to(unfilteredTarget, { ...expanded, duration: speed, ease: 'power1.in' }, 0)
      timeline.to(
        innerTarget,
        { opacity: 1, y: 0, duration: speed * 0.75, ease: 'power1.out' },
        speed * 0.575,
      )

      timelineRef.current = timeline
    } else {
      const timeline = gsap.timeline({
        onComplete: () => {
          setIsVisible(false)
        },
      })
      const targets = [filteredTarget, unfilteredTarget].filter(Boolean)

      timeline.to(innerTarget, { opacity: 0, y: 8, duration: speed * 0.4, ease: 'power1.in' })
      timeline.to(targets, { ...collapsed, duration: speed, ease: 'power1.in' }, speed * 0.2)
      timeline.to(
        targets,
        { opacity: 0, duration: speed * 0.3, ease: 'power1.in' },
        `-=${speed * 0.3}`,
      )

      timelineRef.current = timeline
    }

    return () => {
      timelineRef.current?.kill()
    }
  }, [
    isOpen,
    contentHeight,
    contentWidth,
    contentRadius,
    triggerWidth,
    triggerHeight,
    radius,
    contentLeft,
    translateY,
    speed,
    prefersReducedMotion,
    panelNode,
  ])

  const collapsedStyle = {
    top: 0,
    left: 0,
    width: triggerWidth,
    height: triggerHeight,
    borderRadius: radius,
    opacity: 0,
  }

  const overlay = showOverlay ? (
    <>
      {!prefersReducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ filter: `url(#${filterId})` }}
        >
          <div
            className={cn('absolute', bgClassName)}
            style={{
              top: 0,
              left: 0,
              width: triggerWidth,
              height: triggerHeight,
              borderRadius: radius,
            }}
          />
          <div
            className={cn('absolute', bgClassName)}
            ref={filteredContentRef}
            style={collapsedStyle}
          />
        </div>
      )}

      <div
        className={cn(
          'pointer-events-auto absolute z-10 overflow-hidden',
          bgClassName,
          surfaceClassName,
        )}
        ref={setPanelNode}
        role="dialog"
        style={collapsedStyle}
      >
        <div
          className={cn('p-4', contentClassName)}
          ref={innerContentRef}
          style={{ opacity: 0, transform: 'translateY(16px)' }}
        >
          {children}
        </div>
      </div>
    </>
  ) : null

  return (
    <div className={cn('relative inline-flex', className)} ref={containerRef}>
      <svg aria-hidden="true" className="absolute" style={{ width: 0, height: 0 }}>
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={GOO_STD_DEVIATION} />
            <feColorMatrix
              in="blur"
              result="goo"
              type="matrix"
              values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${String(GOO_MATRIX_ALPHA_MULTIPLIER)} ${String(GOO_MATRIX_ALPHA_OFFSET)}`}
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        ref={measureRef}
        style={{ width: contentWidth, top: OFFSCREEN, left: OFFSCREEN, visibility: 'hidden' }}
      >
        <div className={cn('p-4', contentClassName)}>{children}</div>
      </div>

      <button
        ref={triggerRef}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          'relative z-10 inline-flex items-center justify-center transition-colors',
          bgClassName,
          triggerClassName,
        )}
        onClick={() => setIsOpen(!isOpen)}
        style={
          isFixedSquare
            ? { width: triggerSize, height: triggerSize, borderRadius: radius }
            : { borderRadius: radius }
        }
        type="button"
      >
        {trigger}
      </button>

      {overlay}
    </div>
  )
}
