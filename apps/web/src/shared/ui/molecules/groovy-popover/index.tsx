'use client'

import { AnimatePresence, motion } from 'motion/react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import {
  gooeyPopover,
  gooeySpring,
  subtlePopover,
  subtleTween,
  useReducedTransition,
} from '@/shared/lib/animations'
import { cn } from '@/shared/lib/cn'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

import { GROOVY_SIDE_OFFSET, GROOVY_SURFACE } from './constants'
import { GroovyItem } from './item'

import type { ComponentProps, ReactNode } from 'react'

interface GroovyPopoverContextValue {
  readonly open: boolean
}

const GroovyPopoverContext = createContext<GroovyPopoverContextValue | null>(null)

function useGroovyPopover(): GroovyPopoverContextValue {
  const ctx = useContext(GroovyPopoverContext)
  if (!ctx) throw new Error('GroovyPopover parts must be used within GroovyPopover')
  return ctx
}

interface GroovyPopoverRootProps {
  readonly open?: boolean
  readonly onOpenChange?: (open: boolean) => void
  readonly modal?: boolean
  readonly children: ReactNode
}

function GroovyPopoverRoot({
  open,
  onOpenChange,
  modal = false,
  children,
}: Readonly<GroovyPopoverRootProps>) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setInternalOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange],
  )

  const value = useMemo(() => ({ open: isOpen }), [isOpen])

  return (
    <GroovyPopoverContext.Provider value={value}>
      <Popover open={isOpen} onOpenChange={handleOpenChange} modal={modal}>
        {children}
      </Popover>
    </GroovyPopoverContext.Provider>
  )
}

function GroovyPopoverContent({
  className,
  children,
  sideOffset = GROOVY_SIDE_OFFSET,
  autoFocusContent = false,
  subtle = false,
  ...props
}: Readonly<
  ComponentProps<typeof PopoverContent> & { autoFocusContent?: boolean; subtle?: boolean }
>) {
  const { open } = useGroovyPopover()
  const transition = useReducedTransition(subtle ? subtleTween : gooeySpring)

  return (
    <AnimatePresence>
      {open && (
        <PopoverContent
          asChild
          forceMount
          sideOffset={subtle ? 4 : sideOffset}
          onOpenAutoFocus={autoFocusContent ? undefined : (event) => event.preventDefault()}
          className={cn(GROOVY_SURFACE, subtle && 'rounded-lg', className)}
          {...props}
        >
          <motion.div
            variants={subtle ? subtlePopover : gooeyPopover}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            {children}
          </motion.div>
        </PopoverContent>
      )}
    </AnimatePresence>
  )
}

export const GroovyPopover = Object.assign(GroovyPopoverRoot, {
  Anchor: PopoverAnchor,
  Trigger: PopoverTrigger,
  Content: GroovyPopoverContent,
  Item: GroovyItem,
})
