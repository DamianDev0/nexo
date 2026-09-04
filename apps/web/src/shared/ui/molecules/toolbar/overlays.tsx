'use client'

import { Toolbar as ToolbarPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/shared/lib'
import { DropdownMenuTrigger } from '@/shared/ui/shadcn/dropdown-menu'
import { PopoverTrigger } from '@/shared/ui/shadcn/popover'

import { toolbarItemVariants } from './constants'
import { ToolbarHintTip } from './hint'

import type { ToolbarHint } from './hint'
import type { VariantProps } from 'class-variance-authority'

type TriggerProps = React.ComponentProps<typeof ToolbarPrimitive.Button> &
  VariantProps<typeof toolbarItemVariants> & { hint?: ToolbarHint }

export function ToolbarMenuTrigger({ className, size, hint, ...props }: Readonly<TriggerProps>) {
  return (
    <ToolbarHintTip hint={hint}>
      <DropdownMenuTrigger asChild>
        <ToolbarPrimitive.Button
          data-slot="toolbar-menu-trigger"
          className={cn(toolbarItemVariants({ size }), className)}
          {...props}
        />
      </DropdownMenuTrigger>
    </ToolbarHintTip>
  )
}

export function ToolbarPopoverTrigger({ className, size, hint, ...props }: Readonly<TriggerProps>) {
  return (
    <ToolbarHintTip hint={hint}>
      <PopoverTrigger asChild>
        <ToolbarPrimitive.Button
          data-slot="toolbar-popover-trigger"
          className={cn(toolbarItemVariants({ size }), className)}
          {...props}
        />
      </PopoverTrigger>
    </ToolbarHintTip>
  )
}
