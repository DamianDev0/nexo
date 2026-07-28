'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'

import { SETTINGS_SECTIONS } from '../model/settings-sections'

import type { ReactNode } from 'react'

export function SettingsShell({ children }: Readonly<{ children: ReactNode }>) {
  const { t } = useTranslation()
  const pathname = usePathname()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-9 py-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          {t('settings.title')}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t('settings.subtitle')}</p>
      </header>

      <nav className="flex gap-1 border-b border-border">
        {SETTINGS_SECTIONS.map((section) => {
          const isActive = pathname === section.href
          return (
            <Link
              key={section.key}
              href={section.href}
              className={cn(
                'relative -mb-px border-b-2 px-3.5 py-2.5 text-sm transition-colors',
                isActive
                  ? 'border-primary font-semibold text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`settings.sections.${section.key}`)}
            </Link>
          )
        })}
      </nav>

      <div>{children}</div>
    </div>
  )
}
