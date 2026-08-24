'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { useId } from 'react'

import { indicatorSpring, useReducedTransition } from '@/shared/lib/animations'
import { cn } from '@/shared/lib/cn'

import type { ReactNode } from 'react'

export interface SectionTab {
  readonly key: string
  readonly label: string
  readonly href?: string
}

interface SectionTabsProps {
  readonly tabs: ReadonlyArray<SectionTab>
  readonly active: string
  readonly onChange?: (key: string) => void
  readonly className?: string
}

const TAB_CLASS =
  'relative shrink-0 whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors duration-200'

export function SectionTabs({ tabs, active, onChange, className }: Readonly<SectionTabsProps>) {
  const layoutId = useId()
  const underlineTransition = useReducedTransition(indicatorSpring)

  return (
    <div role="tablist" className={cn('flex gap-1 border-b border-border', className)}>
      {tabs.map((tab) => {
        const isActive = tab.key === active
        const tone = isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        const content: ReactNode = (
          <>
            {tab.label}
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={underlineTransition}
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
              />
            )}
          </>
        )

        return tab.href ? (
          <Link
            key={tab.key}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(TAB_CLASS, tone)}
          >
            {content}
          </Link>
        ) : (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(tab.key)}
            className={cn(TAB_CLASS, tone)}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
