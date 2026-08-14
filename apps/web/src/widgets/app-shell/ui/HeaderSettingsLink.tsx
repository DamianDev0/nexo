'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { GearIcon } from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { settingsPathFor } from '../lib/settings-link'

export function HeaderSettingsLink() {
  const { t } = useTranslation()
  const pathname = usePathname()

  return (
    <HintTooltip asChild hint={t('settings.title')}>
      <HeaderIconButton asChild>
        <Link href={settingsPathFor(pathname)} aria-label={t('settings.title')}>
          <GearIcon className="size-4" />
        </Link>
      </HeaderIconButton>
    </HintTooltip>
  )
}
