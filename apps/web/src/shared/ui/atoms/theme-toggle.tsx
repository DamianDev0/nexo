'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/shadcn/tooltip'

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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleToggle}
            aria-label={t('common.toggleTheme')}
            className="relative text-foreground/60 hover:text-foreground"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('common.toggleTheme')}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
