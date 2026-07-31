'use client'

import { motion } from 'motion/react'
import { useId } from 'react'

import { indicatorSpring, useReducedTransition } from '@/shared/lib/animations'
import { cn } from '@/shared/lib/cn'

export interface SectionTab {
  readonly key: string
  readonly label: string
}

interface SectionTabsProps {
  readonly tabs: ReadonlyArray<SectionTab>
  readonly active: string
  readonly onChange: (key: string) => void
}

export function SectionTabs({ tabs, active, onChange }: Readonly<SectionTabsProps>) {
  const layoutId = useId()
  const underlineTransition = useReducedTransition(indicatorSpring)

  return (
    <div role="tablist" className="flex gap-1 border-b border-border">
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              'relative px-3.5 py-2.5 text-sm font-medium transition-colors duration-200',
              isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={underlineTransition}
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
