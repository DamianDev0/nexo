'use client'

import { motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'

import { cn } from '@/shared/lib'
import {
  dockRevealSpring,
  dockSlideSpring,
  instant,
  subtleTween,
  useReducedTransition,
} from '@/shared/lib/animations'

import type { MouseEvent, ReactNode } from 'react'

export type ActionDockItem = {
  readonly id: string
  readonly label: string
  readonly icon: ReactNode
  readonly onClick?: () => void
  readonly href?: string
  readonly external?: boolean
}

type ActionDockProps = {
  readonly items: ReadonlyArray<ActionDockItem>
  readonly label?: string
  readonly title?: ReactNode
  readonly className?: string
}

const DOCK_BUTTON =
  'flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors duration-120 hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground [&_svg]:size-3.5'

function stop(event: MouseEvent) {
  event.stopPropagation()
}

export function ActionDock({ items, label, title, className }: Readonly<ActionDockProps>) {
  const segRefs = useRef<Array<HTMLSpanElement | null>>([])
  const wasOpenRef = useRef(false)
  const [panel, setPanel] = useState({ width: 0, x: 0, open: false, appearing: true })
  const slide = useReducedTransition(dockSlideSpring)
  const reveal = useReducedTransition(dockRevealSpring)

  const show = useCallback((index: number) => {
    const seg = segRefs.current[index]
    if (!seg) return
    setPanel({
      width: seg.offsetWidth,
      x: -seg.offsetLeft,
      open: true,
      appearing: !wasOpenRef.current,
    })
    wasOpenRef.current = true
  }, [])

  const hide = useCallback(() => {
    wasOpenRef.current = false
    setPanel((current) => ({ ...current, width: 0, open: false, appearing: false }))
  }, [])

  return (
    <span
      role="toolbar"
      aria-label={label}
      onMouseLeave={hide}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) hide()
      }}
      className={cn(
        'flex items-center rounded-md border border-border/70 bg-popover p-0.5 shadow-e2',
        className,
      )}
    >
      {title !== undefined && (
        <>
          <span
            data-slot="action-dock-title"
            className="flex h-6 max-w-96 items-center truncate px-2 text-xs font-medium text-foreground"
          >
            {title}
          </span>
          <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 bg-border" />
        </>
      )}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ width: panel.width, opacity: panel.open ? 1 : 0 }}
        transition={{
          width: panel.appearing ? instant : reveal,
          opacity: subtleTween,
        }}
        className="relative h-6 overflow-hidden"
      >
        <motion.span
          initial={false}
          animate={{ x: panel.x }}
          transition={panel.appearing ? instant : slide}
          className="absolute inset-y-0 left-0 flex w-max items-center"
        >
          {items.map((item, index) => (
            <span
              key={item.id}
              ref={(node) => {
                segRefs.current[index] = node
              }}
              className="flex h-6 items-center px-1.5 text-xs font-medium whitespace-nowrap text-foreground"
            >
              {item.label}
            </span>
          ))}
        </motion.span>
      </motion.span>

      {items.map((item, index) =>
        item.href !== undefined ? (
          <a
            key={item.id}
            href={item.href}
            aria-label={item.label}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noreferrer noopener' : undefined}
            onClick={stop}
            onMouseEnter={() => show(index)}
            onFocus={() => show(index)}
            className={DOCK_BUTTON}
          >
            {item.icon}
          </a>
        ) : (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            onClick={(event) => {
              stop(event)
              item.onClick?.()
            }}
            onMouseEnter={() => show(index)}
            onFocus={() => show(index)}
            className={DOCK_BUTTON}
          >
            {item.icon}
          </button>
        ),
      )}
    </span>
  )
}
