'use client'

import { motion } from 'motion/react'

import { cn } from '@/shared/lib'
import { snappySpring, useReducedTransition } from '@/shared/lib/animations'
import { ActionMenu } from '@/shared/ui/molecules/action-menu'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import type { QuickAction } from './types'

const BUTTON =
  'flex size-10 shrink-0 items-center justify-center rounded-lg border outline-none transition-colors duration-120 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4'

const TONE = {
  default:
    'border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground hover:shadow-xs',
  primary:
    'border-primary bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed',
} as const

function QuickActionButton({
  action,
  tone,
}: Readonly<{ action: QuickAction; tone: keyof typeof TONE }>) {
  const tap = useReducedTransition(snappySpring)
  const blocked = Boolean(action.disabled)
  const explained = blocked && Boolean(action.reason)
  const button = (
    <motion.button
      type="button"
      aria-label={action.label}
      aria-disabled={blocked || undefined}
      disabled={blocked && !explained}
      onClick={blocked || action.menu ? undefined : action.onClick}
      whileHover={blocked ? undefined : { y: -1 }}
      whileTap={blocked ? undefined : { scale: 0.94 }}
      transition={tap}
      className={cn(BUTTON, TONE[tone], explained && 'cursor-not-allowed opacity-40')}
    >
      {action.icon}
    </motion.button>
  )

  if (action.menu) {
    return (
      <ActionMenu items={action.menu} align="end">
        {button}
      </ActionMenu>
    )
  }
  return (
    <HintTooltip asChild hint={action.reason ?? action.label}>
      {button}
    </HintTooltip>
  )
}

type RecordDrawerQuickActionsProps = {
  readonly items: ReadonlyArray<QuickAction>
  readonly label: string
  readonly primary?: QuickAction
}

export function RecordDrawerQuickActions({
  items,
  label,
  primary,
}: Readonly<RecordDrawerQuickActionsProps>) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      data-slot="record-drawer-quick-actions"
      className="flex items-center gap-1.5 px-4 py-3"
    >
      {items.map((action) => (
        <QuickActionButton key={action.id} action={action} tone="default" />
      ))}
      {primary ? (
        <span className="ml-auto flex items-center gap-2 pl-1">
          <span aria-hidden className="h-8 w-px shrink-0 bg-border" />
          <QuickActionButton action={primary} tone="primary" />
        </span>
      ) : null}
    </div>
  )
}
