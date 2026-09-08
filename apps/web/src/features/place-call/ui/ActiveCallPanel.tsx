'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import {
  CircleIcon,
  DotsThreeIcon,
  GridNineIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PauseIcon,
  PhoneIcon,
  PlusIcon,
} from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { DialPad } from '@/shared/ui/organisms/dial-pad'

import { formatCallDuration } from '../lib/call-duration'
import { statusLabel } from '../lib/call-status-label'

import { CallControl, GhostControl } from './CallControls'

import type { CallStatus, TelephonyError } from '../model/types/call.types'

type ActiveCallPanelProps = {
  readonly call: {
    readonly number: string
    readonly name: string | null
    readonly status: CallStatus
    readonly error: TelephonyError | null
    readonly seconds: number
    readonly muted: boolean
    readonly held: boolean
    readonly recording: boolean
  }
  readonly actions: {
    readonly onToggleMute: () => void
    readonly onToggleHold: () => void
    readonly onToggleRecord: () => void
    readonly onHangUp: () => void
  }
  readonly keypad: {
    readonly open: boolean
    readonly digits: string
    readonly onToggle: () => void
    readonly onDigit: (digit: string) => void
  }
}

export function ActiveCallPanel({ call, actions, keypad }: Readonly<ActiveCallPanelProps>) {
  const { t } = useTranslation()
  const active = call.status === 'active'
  const over = call.status === 'ended' || call.status === 'failed'

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between bg-sidebar px-4">
        <Text className="flex items-center gap-2 text-[11px] font-black tracking-[0.14em] text-sidebar-foreground uppercase">
          <span aria-hidden className="size-2 rounded-full bg-primary" />
          {statusLabel(call, t)}
        </Text>
        <Text className="font-mono text-sm text-sidebar-foreground tabular-nums" aria-live="polite">
          {active ? formatCallDuration(call.seconds) : ''}
        </Text>
      </div>
      {keypad.open ? (
        <div className="flex flex-1 flex-col items-center px-4 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <PhoneIcon className="size-4" />
            </div>
            <span className="flex min-w-0 flex-col">
              <Text className="text-sm font-bold tracking-tight">
                {call.name ?? t('dialer.unknown')}
              </Text>
              <Text variant="hint" className="tabular-nums">
                {call.number}
              </Text>
            </span>
          </div>
          <Text variant="strong" className="mt-1.5 h-5 text-base tabular-nums">
            {keypad.digits}
          </Text>
          <DialPad
            value={keypad.digits}
            onDigit={keypad.onDigit}
            onDelete={() => undefined}
            className="flex-1 justify-center"
          >
            <DialPad.Keypad className="gap-x-9 gap-y-3 [&>button]:size-11 [&>button]:border-0 [&>button]:bg-transparent [&>button]:hover:bg-muted" />
          </DialPad>
        </div>
      ) : (
        <>
          <div className="flex shrink-0 flex-col items-center gap-1 px-4 pt-5 pb-4">
            <div className="mb-1.5 flex size-14 items-center justify-center rounded-3xl bg-accent text-accent-foreground">
              <PhoneIcon className="size-6" />
            </div>
            <Text className="text-lg font-bold tracking-tight">
              {call.name ?? t('dialer.unknown')}
            </Text>
            <Text variant="muted" className="tabular-nums">
              {call.number}
            </Text>
          </div>
          <div className="grid flex-1 grid-cols-3 content-start gap-y-3 px-5">
            <CallControl
              label={call.muted ? t('dialer.unmute') : t('dialer.mute')}
              icon={
                call.muted ? (
                  <MicrophoneSlashIcon className="size-5" />
                ) : (
                  <MicrophoneIcon className="size-5" />
                )
              }
              active={call.muted}
              disabled={!active}
              onPress={actions.onToggleMute}
            />
            <CallControl
              label={t('dialer.keypad')}
              icon={<GridNineIcon className="size-5" />}
              disabled={!active}
              onPress={keypad.onToggle}
            />
            <CallControl
              label={call.held ? t('dialer.resume') : t('dialer.hold')}
              icon={<PauseIcon className="size-5" />}
              active={call.held}
              disabled={!active}
              onPress={actions.onToggleHold}
            />
            <GhostControl
              label={t('dialer.addCall')}
              icon={<PlusIcon className="size-5" />}
              hint={t('dialer.comingSoon')}
            />
            <CallControl
              label={t('dialer.record')}
              icon={<CircleIcon className="size-5" />}
              active={call.recording}
              disabled={!active}
              onPress={actions.onToggleRecord}
            />
            <GhostControl
              label={t('dialer.callActions')}
              icon={<DotsThreeIcon className="size-5" />}
              hint={t('dialer.comingSoon')}
            />
          </div>
        </>
      )}
      <div className="flex shrink-0 items-center justify-center gap-4 px-4 pt-2 pb-4">
        <PillButton
          variant="destructive"
          size="md"
          aria-label={t('dialer.hangUp')}
          disabled={over}
          onClick={actions.onHangUp}
          className="size-13 rounded-full px-0"
        >
          <PhoneIcon className="size-5.5 rotate-135" />
        </PillButton>
        {keypad.open ? (
          <HintTooltip asChild hint={t('dialer.hideKeypad')}>
            <PillButton
              variant="icon"
              size="md"
              aria-label={t('dialer.hideKeypad')}
              aria-pressed
              onClick={keypad.onToggle}
              className="size-13 rounded-full bg-accent"
            >
              <GridNineIcon className="size-5" />
            </PillButton>
          </HintTooltip>
        ) : null}
      </div>
    </div>
  )
}
