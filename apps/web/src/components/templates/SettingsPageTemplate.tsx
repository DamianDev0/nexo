'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/utils'

interface SettingsNavItem {
  readonly label: string
  readonly href: string
  readonly icon?: React.ReactNode
}

interface SettingsPageTemplateProps {
  readonly title: string
  readonly description?: string
  readonly navItems: SettingsNavItem[]
  readonly children: React.ReactNode
  readonly className?: string
}

export function SettingsPageTemplate({
  title,
  description,
  navItems,
  children,
  className,
}: SettingsPageTemplateProps) {
  const pathname = usePathname()

  return (
    <div className={cn('flex flex-col gap-6 p-6', className)}>
      {/* Page header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Two-column: nav + content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Left nav */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
