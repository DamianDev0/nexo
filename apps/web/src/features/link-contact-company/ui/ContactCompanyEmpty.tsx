'use client'

import { useTranslation } from 'react-i18next'

import { IconFrame } from '@/shared/ui/atoms/icon-frame'
import { Text } from '@/shared/ui/atoms/text'
import { BuildingsIcon } from '@/shared/ui/icons'

type ContactCompanyEmptyProps = {
  readonly picker: React.ReactNode
}

export function ContactCompanyEmpty({ picker }: Readonly<ContactCompanyEmptyProps>) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <IconFrame tone="outline">
          <BuildingsIcon />
        </IconFrame>
        <Text variant="muted">{t('contacts.company.empty')}</Text>
      </div>
      {picker}
    </div>
  )
}
