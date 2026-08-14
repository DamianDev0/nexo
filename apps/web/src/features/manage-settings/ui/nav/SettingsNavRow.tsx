'use client'

import Link from 'next/link'

import { cn } from '@/shared/lib/cn'
import { CaretRightIcon } from '@/shared/ui/icons'

import type { AppIcon } from '@/shared/ui/icons'

interface SettingsNavRowProps {
  readonly label: string
  readonly href: string
  readonly icon?: AppIcon
  readonly isActive: boolean
  readonly hasChildren?: boolean
}

const ROW = 'group relative flex items-center gap-2.5 py-1.5 pr-3 text-sm transition-colors'
const RAIL =
  'after:absolute after:inset-y-1 after:right-0 after:w-0.5 after:rounded-full after:bg-primary'
const ICON_ACTIVE = 'text-primary'
const ICON_IDLE = 'text-faint group-hover:text-primary'

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
      aria-current={isActive && !hasChildren ? 'page' : undefined}
      className={cn(
        ROW,
        Icon ? '-mx-3 pl-5.5' : '-mr-3 pl-3',
        isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
        isActive && !hasChildren && RAIL,
      )}
    >
      {Icon && <Icon className={cn('size-4 shrink-0', isActive ? ICON_ACTIVE : ICON_IDLE)} />}
      {label}
      {hasChildren && (
        <CaretRightIcon
          className={cn(
            'ml-auto size-3.5 transition-transform duration-200',
            isActive ? 'rotate-90 text-muted-foreground' : 'text-faint',
          )}
        />
      )}
    </Link>
  )
}
