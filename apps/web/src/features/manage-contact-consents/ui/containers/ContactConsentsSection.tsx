'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { buildChannelConsents } from '../../lib/consent-state'
import { useContactConsents } from '../../query/useContactConsents'
import { useSaveContactConsent } from '../../query/useSaveContactConsent'
import { ConsentChannelRow } from '../ConsentChannelRow'

type ContactConsentsSectionProps = {
  readonly contactId: string
  readonly enabled?: boolean
}

export function ContactConsentsSection({
  contactId,
  enabled = true,
}: Readonly<ContactConsentsSectionProps>) {
  const { t } = useTranslation()
  const { consents, isPending } = useContactConsents(contactId, enabled)
  const save = useSaveContactConsent(contactId)

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      <Text variant="hint" className="pb-2">
        {t('contacts.consents.hint')}
      </Text>
      {buildChannelConsents(consents).map((consent) => (
        <ConsentChannelRow
          key={consent.channel}
          consent={consent}
          disabled={save.isPending}
          onChange={(granted) => save.mutate({ channel: consent.channel, granted })}
        />
      ))}
    </div>
  )
}
