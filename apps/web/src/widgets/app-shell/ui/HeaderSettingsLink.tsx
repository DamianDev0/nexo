'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { GearIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/shadcn/tooltip'

import { settingsPathFor } from '../lib/settings-link'

export function HeaderSettingsLink() {
  const { t } = useTranslation()
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent>{t('settings.title')}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
