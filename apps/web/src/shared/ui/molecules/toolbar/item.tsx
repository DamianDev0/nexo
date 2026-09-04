'use client'

import { Toggle as TogglePrimitive, Toolbar as ToolbarPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/shared/lib'

import { toolbarItemVariants } from './constants'
import { ToolbarHintTip } from './hint'

import type { ToolbarHint } from './hint'
import type { VariantProps } from 'class-variance-authority'

type ItemExtras = VariantProps<typeof toolbarItemVariants> & { hint?: ToolbarHint }

export function ToolbarButton({
  className,
  size,
  hint,
  ...props
}: Readonly<React.ComponentProps<typeof ToolbarPrimitive.Button> & ItemExtras>) {
  return (
    <ToolbarHintTip hint={hint}>
      <ToolbarPrimitive.Button
        data-slot="toolbar-button"
        className={cn(toolbarItemVariants({ size }), className)}
        {...props}
      />
    </ToolbarHintTip>
  )
}

export function ToolbarToggle({
  className,
  size,
  hint,
  ...props
}: Readonly<React.ComponentProps<typeof TogglePrimitive.Root> & ItemExtras>) {
  return (
    <ToolbarHintTip hint={hint}>
      <ToolbarPrimitive.Button asChild>
        <TogglePrimitive.Root
          data-slot="toolbar-toggle"
          className={cn(toolbarItemVariants({ size }), className)}
          {...props}
        />
      </ToolbarPrimitive.Button>
    </ToolbarHintTip>
  )
}

export function ToolbarToggleGroup({
  className,
  ...props
}: Readonly<React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup>>) {
  return (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toolbar-toggle-group"
      className={cn('flex items-center gap-0.5', className)}
      {...props}
    />
  )
}

export function ToolbarToggleItem({
  className,
  size,
  hint,
  ...props
}: Readonly<React.ComponentProps<typeof ToolbarPrimitive.ToggleItem> & ItemExtras>) {
  return (
    <ToolbarHintTip hint={hint}>
      <ToolbarPrimitive.ToggleItem
        data-slot="toolbar-toggle-item"
        className={cn(toolbarItemVariants({ size }), className)}
        {...props}
      />
    </ToolbarHintTip>
  )
}
