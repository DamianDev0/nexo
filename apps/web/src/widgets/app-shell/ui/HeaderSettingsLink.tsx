'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { GearIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Button } from '@/shared/ui/shadcn/button'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { settingsPathFor } from '../lib/settings-link'

export function HeaderSettingsLink() {
  const { t } = useTranslation()
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={400}>
      <HintTooltip asChild hint={t('settings.title')}>
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          className="text-foreground/60 hover:text-foreground"
        >
          <Link href={settingsPathFor(pathname)} aria-label={t('settings.title')}>
            <GearIcon className="size-4" />
          </Link>
        </Button>
      </HintTooltip>
    </TooltipProvider>
  )
}
