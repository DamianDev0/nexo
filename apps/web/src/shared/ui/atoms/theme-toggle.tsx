'use client'

import { useTheme } from 'next-themes'
import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { MoonIcon, SunIcon } from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

export function ThemeToggle() {
  const { t } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()

  const handleToggle = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => {
        flushSync(() => setTheme(next))
      })
      return
    }
    setTheme(next)
  }, [resolvedTheme, setTheme])

  return (
    <HintTooltip asChild hint={t('common.toggleTheme')} side="bottom">
      <HeaderIconButton
        onClick={handleToggle}
        aria-label={t('common.toggleTheme')}
        className="relative"
      >
        <SunIcon className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      </HeaderIconButton>
    </HintTooltip>
  )
}
