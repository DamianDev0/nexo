'use client'

import { useTranslation } from 'react-i18next'

import { CheckIcon, TranslateIcon } from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'

import { LANGUAGES } from '../config/languages'
import { useSwitchLanguage } from '../model/use-switch-language'

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const { current, switchTo } = useSwitchLanguage()

  return (
    <DropdownMenu>
      <HintTooltip
        asChild
        hint={`${t('language.switch')} · ${current.toUpperCase()}`}
        side="bottom"
      >
        <DropdownMenuTrigger asChild>
          <HeaderIconButton aria-label={t('language.switch')}>
            <TranslateIcon className="size-4" />
          </HeaderIconButton>
        </DropdownMenuTrigger>
      </HintTooltip>
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
