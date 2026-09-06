'use client'

import { useTranslation } from 'react-i18next'

import { usePhoneDock } from '@/features/place-call'
import { PhoneIcon } from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

export function HeaderPhone() {
  const { t } = useTranslation()
  const dock = usePhoneDock()

  return (
    <HintTooltip asChild hint={t('dialer.title')}>
      <HeaderIconButton aria-label={t('dialer.open')} onClick={dock.show}>
        <PhoneIcon className="size-4" />
      </HeaderIconButton>
    </HintTooltip>
  )
}
