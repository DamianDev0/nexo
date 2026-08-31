'use client'

import Link from 'next/link'

import { cn } from '@/shared/lib/cn'
import { CaretRightIcon } from '@/shared/ui/icons'

interface SettingsNavRowProps {
  readonly label: string
  readonly href: string
  readonly isActive: boolean
  readonly hasChildren?: boolean
}

const ROW =
  'group relative -mr-3 flex items-center gap-2.5 py-1.5 pl-2.5 pr-3 text-sm transition-colors'
const RAIL =
  'after:absolute after:inset-y-1 after:right-0 after:w-0.5 after:rounded-full after:bg-primary'

export function SettingsNavRow({
  label,
  href,
  isActive,
  hasChildren = false,
}: Readonly<SettingsNavRowProps>) {
  return (
    <Link
      href={href}
      aria-current={isActive && !hasChildren ? 'page' : undefined}
      className={cn(
        ROW,
        isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground',
        isActive && !hasChildren && RAIL,
      )}
    >
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
