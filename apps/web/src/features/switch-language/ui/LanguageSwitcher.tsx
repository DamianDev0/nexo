'use client'

import { Check, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'

import { LANGUAGES } from '../model/languages'
import { useSwitchLanguage } from '../model/use-switch-language'

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const { current, switchTo } = useSwitchLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('language.switch')}
          className="gap-1.5 text-foreground/60 hover:text-foreground"
        >
          <Languages className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">{current}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {LANGUAGES.map(({ locale, label }) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() => switchTo(locale)}
            className="justify-between"
          >
            {label}
            {locale === current ? <Check className="size-4 text-primary-deep" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
