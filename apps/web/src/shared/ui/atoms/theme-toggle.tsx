'use client'

import { useTheme } from 'next-themes'
import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { MoonIcon, SunIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Button } from '@/shared/ui/shadcn/button'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

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
    <TooltipProvider delayDuration={400}>
      <HintTooltip asChild hint={t('common.toggleTheme')} side="bottom">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleToggle}
          aria-label={t('common.toggleTheme')}
          className="relative text-foreground/60 hover:text-foreground"
        >
          <SunIcon className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>
      </HintTooltip>
    </TooltipProvider>
  )
}
