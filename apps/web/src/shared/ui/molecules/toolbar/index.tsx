'use client'

import { Toolbar as ToolbarPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/shared/lib'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/ui/shadcn/dropdown-menu'
import { Popover, PopoverContent } from '@/shared/ui/shadcn/popover'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { ToolbarButton, ToolbarToggle, ToolbarToggleGroup, ToolbarToggleItem } from './item'
import { ToolbarMenuTrigger, ToolbarPopoverTrigger } from './overlays'

function ToolbarRoot({
  className,
  ...props
}: Readonly<React.ComponentProps<typeof ToolbarPrimitive.Root>>) {
  return (
    <TooltipProvider delayDuration={350} skipDelayDuration={500}>
      <ToolbarPrimitive.Root
        data-slot="toolbar"
        className={cn(
          'flex w-fit items-center gap-1 rounded-lg border bg-card p-1 shadow-md',
          className,
        )}
        {...props}
      />
    </TooltipProvider>
  )
}

function ToolbarGroup({ className, ...props }: Readonly<React.ComponentProps<'div'>>) {
  return (
    <div
      data-slot="toolbar-group"
      role="group"
      className={cn('flex items-center gap-0.5', className)}
      {...props}
    />
  )
}

function ToolbarSeparator({
  className,
  ...props
}: Readonly<React.ComponentProps<typeof ToolbarPrimitive.Separator>>) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn('mx-1 h-5 w-px shrink-0 bg-border', className)}
      {...props}
    />
  )
}

export const Toolbar = Object.assign(ToolbarRoot, {
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
  Button: ToolbarButton,
  Toggle: ToolbarToggle,
  ToggleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
  Menu: DropdownMenu,
  MenuTrigger: ToolbarMenuTrigger,
  MenuContent: DropdownMenuContent,
  MenuItem: DropdownMenuItem,
  MenuLabel: DropdownMenuLabel,
  MenuSeparator: DropdownMenuSeparator,
  Popover,
  PopoverTrigger: ToolbarPopoverTrigger,
  PopoverContent,
})

export type { ToolbarHint } from './hint'
