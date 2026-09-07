import { cn } from '@/shared/lib'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { PlusIcon } from '@/shared/ui/icons'

import type { ReactNode } from 'react'

const CHIP =
  'inline-flex h-7 max-w-full items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium'

type ChipProps = {
  readonly children: ReactNode
  readonly color?: string
  readonly className?: string
}

function ChipRoot({ children, color, className }: Readonly<ChipProps>) {
  return (
    <span data-slot="chip" className={cn(CHIP, 'border-border bg-card text-foreground', className)}>
      {color ? <ColorDot color={color} className="size-1.5" /> : null}
      <span className="truncate">{children}</span>
    </span>
  )
}

type ChipAddProps = {
  readonly label: string
  readonly onClick: () => void
  readonly className?: string
}

function ChipAdd({ label, onClick, className }: Readonly<ChipAddProps>) {
  return (
    <button
      type="button"
      data-slot="chip-add"
      onClick={onClick}
      className={cn(
        CHIP,
        'cursor-pointer border-dashed border-border-strong/60 bg-transparent text-muted-foreground transition-colors duration-120 outline-none hover:border-border-strong hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3',
        className,
      )}
    >
      <PlusIcon />
      {label}
    </button>
  )
}

export const Chip = Object.assign(ChipRoot, { Add: ChipAdd })
