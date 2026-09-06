'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { PhoneDisconnectIcon, PhoneIcon } from '@/shared/ui/icons'

import { formatCallDuration } from '../lib/call-duration'
import { formatCallLogDate } from '../lib/call-log'
import { formatDialNumber } from '../lib/format-dial-number'

import { DockEmpty } from './DockEmpty'

import type { CallLogEntry } from '../model/types/call.types'

type CallsViewProps = {
  readonly entries: readonly CallLogEntry[]
  readonly now: number
  readonly onCall: (number: string, name?: string) => void
}

export function CallsView({ entries, now, onCall }: Readonly<CallsViewProps>) {
  const { t } = useTranslation()

  if (entries.length === 0) {
    return <DockEmpty icon={<PhoneIcon className="size-7" />} label={t('dialer.callsEmpty')} />
  }

  return (
    <ul className="flex-1 overflow-y-auto">
      {entries.map((entry) => (
        <li key={entry.id} className="border-b border-border/60 last:border-b-0">
          <PillButton
            variant="ghost"
            size="sm"
            aria-label={t('dialer.callAgain')}
            onClick={() => onCall(entry.number, entry.name ?? undefined)}
            className="h-14 w-full justify-start gap-3 rounded-none px-4 font-normal"
          >
            {entry.outcome === 'completed' ? (
              <PhoneIcon className="size-4.5 shrink-0 text-positive" />
            ) : (
              <PhoneDisconnectIcon className="size-4.5 shrink-0 text-destructive" />
            )}
            <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
              <Text variant="strong" className="max-w-full truncate tabular-nums">
                {entry.name ?? formatDialNumber(entry.number)}
              </Text>
              <Text variant="hint" className="tabular-nums">
                {formatCallDuration(entry.durationSec)}
              </Text>
            </span>
            <Text variant="hint" className="shrink-0 font-light tabular-nums">
              {formatCallLogDate(entry.at, now)}
            </Text>
          </PillButton>
        </li>
      ))}
    </ul>
  )
}
