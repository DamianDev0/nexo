'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { gooeyPopover, gooeySpring, useReducedTransition } from '@/shared/lib/animations'
import { cn } from '@/shared/lib/cn'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

import { GROOVY_ARROW, GROOVY_ARROW_SIZE, GROOVY_SIDE_OFFSET, GROOVY_SURFACE } from './constants'
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
  readonly children: ReactNode
}

function GroovyPopoverRoot({ open, onOpenChange, children }: Readonly<GroovyPopoverRootProps>) {
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
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
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
  ...props
}: Readonly<ComponentProps<typeof PopoverContent> & { autoFocusContent?: boolean }>) {
  const { open } = useGroovyPopover()
  const transition = useReducedTransition(gooeySpring)

  return (
    <AnimatePresence>
      {open && (
        <PopoverContent
          asChild
          forceMount
          sideOffset={sideOffset}
          onOpenAutoFocus={autoFocusContent ? undefined : (event) => event.preventDefault()}
          className={cn(GROOVY_SURFACE, className)}
          {...props}
        >
          <motion.div
            variants={gooeyPopover}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            {children}
            <PopoverPrimitive.Arrow
              className={GROOVY_ARROW}
              width={GROOVY_ARROW_SIZE.width}
              height={GROOVY_ARROW_SIZE.height}
            />
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
