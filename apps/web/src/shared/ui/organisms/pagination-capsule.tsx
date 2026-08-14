'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { cn } from '@/shared/lib'
import { collapseHorizontal, smoothEase, useReducedTransition } from '@/shared/lib/animations'
import { CaretDoubleRightIcon, CaretLeftIcon, CaretRightIcon } from '@/shared/ui/icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'

import { ScrollTrack } from './pagination-capsule/scroll-track'

import type { ReactNode } from 'react'

export interface NavLabels {
  readonly prev: string
  readonly next: string
}

interface IconButtonProps {
  readonly label: string
  readonly onClick: () => void
  readonly children: ReactNode
  readonly disabled?: boolean
  readonly expanded?: boolean
}

function IconButton({ label, disabled, expanded, onClick, children }: Readonly<IconButtonProps>) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors duration-120',
        disabled ? 'cursor-default text-disabled-fg' : 'cursor-pointer text-body hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}

interface RootProps {
  readonly label: string
  readonly collapseLabel: string
  readonly children: ReactNode
  readonly className?: string
}

function Root({ label, collapseLabel, children, className }: Readonly<RootProps>) {
  const [collapsed, setCollapsed] = useState(false)
  const transition = useReducedTransition(smoothEase)

  return (
    <nav
      data-slot="pagination-capsule"
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl bg-card p-1.5 shadow-capsule',
        className,
      )}
    >
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="pagination-content"
            variants={collapseHorizontal}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="inline-flex items-center gap-2 overflow-hidden whitespace-nowrap"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
      <IconButton
        label={collapseLabel}
        expanded={!collapsed}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <motion.span
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={transition}
          className="inline-flex"
        >
          <CaretDoubleRightIcon className="size-4" />
        </motion.span>
      </IconButton>
    </nav>
  )
}

function Divider() {
  return <span className="h-5 w-px shrink-0 bg-border" />
}

export interface NavProps {
  readonly page: number
  readonly totalPages: number
  readonly onPageChange: (page: number) => void
  readonly labels: NavLabels
}

function Nav({ page, totalPages, onPageChange, labels }: Readonly<NavProps>) {
  return (
    <span className="inline-flex items-center gap-1">
      <IconButton label={labels.prev} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <CaretLeftIcon className="size-4" />
      </IconButton>
      <span aria-current="page" className="text-sm font-medium tabular-nums text-body">
        {page} / {totalPages}
      </span>
      <IconButton
        label={labels.next}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <CaretRightIcon className="size-4" />
      </IconButton>
    </span>
  )
}

export interface PageSizeProps {
  readonly value: number
  readonly options: ReadonlyArray<number>
  readonly onChange: (size: number) => void
  readonly label: string
}

function PageSize({ value, options, onChange, label }: Readonly<PageSizeProps>) {
  return (
    <Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
      <SelectTrigger
        size="sm"
        aria-label={label}
        className="h-7 w-16 gap-1 border-none bg-transparent px-2 text-sm font-bold tabular-nums text-primary-deep shadow-none hover:bg-muted focus-visible:ring-0 [&_svg]:text-primary-deep"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="min-w-0">
        {options.map((option) => (
          <SelectItem key={option} value={String(option)} className="text-sm tabular-nums">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const PaginationCapsule = Object.assign(Root, {
  Nav,
  PageSize,
  ScrollTrack,
  Divider,
})
