'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'

import type { ChannelConsent } from '../lib/consent-state'

type ConsentChannelRowProps = {
  readonly consent: ChannelConsent
  readonly onChange: (granted: boolean) => void
  readonly disabled?: boolean
}

export function ConsentChannelRow({
  consent,
  onChange,
  disabled,
}: Readonly<ConsentChannelRowProps>) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="flex min-w-0 flex-col">
        <Text variant="body" className="truncate">
          {t(`contacts.preview.optedOut.${consent.channel}`)}
        </Text>
        {consent.granted ? null : (
          <Text variant="hint" className="truncate">
            {consent.reason ?? t('contacts.consents.revokedHint')}
          </Text>
        )}
      </span>
      <AnimatedToggle
        size="sm"
        checked={consent.granted}
        disabled={disabled}
        label={t('contacts.consents.toggle', {
          channel: t(`contacts.preview.optedOut.${consent.channel}`),
        })}
        onChange={onChange}
      />
    </div>
  )
}
