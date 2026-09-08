'use client'

import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { CaretDownIcon } from '@/shared/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'

import type { ReactNode } from 'react'

export type ChoiceOption = {
  readonly key: string
  readonly label: string
  readonly color?: string
}

export type ChoiceCellSelection = {
  readonly value: string | null
  readonly options: ReadonlyArray<ChoiceOption>
  readonly onChange?: (value: string | null) => void
  readonly clearLabel?: string
}

type ContactChoiceCellProps = {
  readonly label: string
  readonly selection: ChoiceCellSelection
  readonly children: ReactNode
}

export function ContactChoiceCell({
  label,
  selection,
  children,
}: Readonly<ContactChoiceCellProps>) {
  const { value, options, onChange, clearLabel } = selection
  if (!onChange || options.length === 0) return <>{children}</>

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PillButton
          variant="ghost"
          size="sm"
          aria-label={label}
          data-slot="choice-picker"
          className="h-auto w-full min-w-0 justify-between gap-1 rounded-md px-1 py-0.5 font-normal hover:bg-muted"
        >
          {children}
          <CaretDownIcon className="size-3.5 shrink-0 text-faint" />
        </PillButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.key}
            disabled={option.key === value}
            onSelect={() => onChange(option.key)}
          >
            {option.color ? <ColorDot color={option.color} /> : null}
            {option.label}
          </DropdownMenuItem>
        ))}
        {clearLabel && value !== null ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange(null)}>{clearLabel}</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
