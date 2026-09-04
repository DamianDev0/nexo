'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import {
  GridNineIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PauseIcon,
  PhoneDisconnectIcon,
  PhoneIcon,
} from '@/shared/ui/icons'
import { DialPad } from '@/shared/ui/organisms/dial-pad'

import { statusLabel } from '../lib/call-status-label'

import type { CallStatus } from '../model/types/call.types'
import type { ReactNode } from 'react'

type ActiveCallPanelProps = {
  readonly call: {
    readonly number: string
    readonly status: CallStatus
    readonly seconds: number
    readonly muted: boolean
    readonly held: boolean
  }
  readonly actions: {
    readonly onToggleMute: () => void
    readonly onToggleHold: () => void
    readonly onHangUp: () => void
  }
  readonly keypad: {
    readonly open: boolean
    readonly digits: string
    readonly onToggle: () => void
    readonly onDigit: (digit: string) => void
  }
}

type CallControlProps = {
  readonly label: string
  readonly icon: ReactNode
  readonly active?: boolean
  readonly disabled?: boolean
  readonly onPress: () => void
}

function CallControl({ label, icon, active, disabled, onPress }: Readonly<CallControlProps>) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <PillButton
        variant="icon"
        size="md"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onPress}
        className={cn('size-12 rounded-full', active && 'bg-accent')}
      >
        {icon}
      </PillButton>
      <Text variant="micro">{label}</Text>
    </span>
  )
}

export function ActiveCallPanel({ call, actions, keypad }: Readonly<ActiveCallPanelProps>) {
  const { t } = useTranslation()
  const ended = call.status === 'ended'

  return (
    <div className="flex flex-1 flex-col items-center justify-between px-4 pt-5 pb-4">
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary-deep dark:text-primary">
          <PhoneIcon className="size-5.5" />
        </div>
        <Text variant="strong" className="text-lg tracking-wide tabular-nums">
          {call.number}
        </Text>
        <Text variant="muted" className="tabular-nums" aria-live="polite">
          {statusLabel(call.status, call.seconds, t)}
        </Text>
      </div>
      {keypad.open ? (
        <DialPad value={keypad.digits} onDigit={keypad.onDigit} onDelete={() => undefined}>
          <Text variant="hint" className="h-4 tabular-nums">
            {keypad.digits}
          </Text>
          <DialPad.Keypad className="gap-1.5 [&>button]:size-11" />
        </DialPad>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <CallControl
            label={call.muted ? t('dialer.unmute') : t('dialer.mute')}
            icon={
              call.muted ? (
                <MicrophoneSlashIcon className="size-4.5" />
              ) : (
                <MicrophoneIcon className="size-4.5" />
              )
            }
            active={call.muted}
            disabled={ended}
            onPress={actions.onToggleMute}
          />
          <CallControl
            label={t('dialer.keypad')}
            icon={<GridNineIcon className="size-4.5" />}
            disabled={ended || call.status !== 'active'}
            onPress={keypad.onToggle}
          />
          <CallControl
            label={call.held ? t('dialer.resume') : t('dialer.hold')}
            icon={<PauseIcon className="size-4.5" />}
            active={call.held}
            disabled={ended || call.status !== 'active'}
            onPress={actions.onToggleHold}
          />
        </div>
      )}
      <div className="flex items-center gap-4">
        {keypad.open ? (
          <PillButton variant="outline" size="xs" onClick={keypad.onToggle}>
            {t('dialer.hideKeypad')}
          </PillButton>
        ) : null}
        <PillButton
          variant="destructive"
          size="md"
          aria-label={t('dialer.hangUp')}
          disabled={ended}
          onClick={actions.onHangUp}
          className="w-16 rounded-full px-0"
        >
          <PhoneDisconnectIcon className="size-5" />
        </PillButton>
      </div>
    </div>
  )
}
