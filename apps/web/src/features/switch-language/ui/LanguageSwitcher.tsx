'use client'

import { useTranslation } from 'react-i18next'

import { CheckIcon, TranslateIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Button } from '@/shared/ui/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { LANGUAGES } from '../config/languages'
import { useSwitchLanguage } from '../model/use-switch-language'

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const { current, switchTo } = useSwitchLanguage()

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={400}>
        <HintTooltip asChild hint={t('language.switch')} side="bottom">
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('language.switch')}
              className="gap-1.5 text-foreground/60 hover:text-foreground"
            >
              <TranslateIcon className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">{current}</span>
            </Button>
          </DropdownMenuTrigger>
        </HintTooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="min-w-36">
        {LANGUAGES.map(({ locale, label }) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() => switchTo(locale)}
            className="justify-between"
          >
            {label}
            {locale === current ? <CheckIcon className="size-4 text-primary-deep" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
