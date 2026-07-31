'use client'

import Link from 'next/link'

import { cn } from '@/shared/lib/cn'

import type { AppIcon } from '@/shared/ui/icons'

interface SettingsNavRowProps {
  readonly label: string
  readonly href: string
  readonly icon?: AppIcon
  readonly isActive: boolean
  readonly hasChildren?: boolean
}

const ROW = 'relative -mx-3 flex items-center gap-2.5 py-1.5 pr-3 text-sm transition-colors'
const HIGHLIGHT =
  'bg-muted after:absolute after:inset-y-0 after:right-0 after:w-0.5 after:bg-primary'

export function SettingsNavRow({
  label,
  href,
  icon: Icon,
  isActive,
  hasChildren = false,
}: Readonly<SettingsNavRowProps>) {
  return (
    <Link
      href={href}
      className={cn(
        ROW,
        Icon ? 'pl-5.5' : 'pl-11',
        isActive
          ? 'font-medium text-primary'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        isActive && !hasChildren && HIGHLIGHT,
      )}
    >
      {Icon && (
        <Icon
          className={cn('size-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
        />
      )}
      {label}
    </Link>
  )
}
