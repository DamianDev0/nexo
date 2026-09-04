'use client'

import { useTranslation } from 'react-i18next'

import { DialPad } from '@/shared/ui/organisms/dial-pad'

type DialerPanelProps = {
  readonly value: string
  readonly canCall: boolean
  readonly actions: {
    readonly onDigit: (digit: string) => void
    readonly onDelete: () => void
    readonly onCall: () => void
  }
}

export function DialerPanel({ value, canCall, actions }: Readonly<DialerPanelProps>) {
  const { t } = useTranslation()
  return (
    <DialPad value={value} onDigit={actions.onDigit} onDelete={actions.onDelete}>
      <DialPad.Display placeholder={t('dialer.placeholder')} />
      <DialPad.Keypad />
      <div className="grid w-full grid-cols-3 items-center justify-items-center gap-2.5">
        <span aria-hidden />
        <DialPad.Call label={t('dialer.call')} onCall={actions.onCall} disabled={!canCall} />
        <DialPad.Backspace label={t('dialer.backspace')} />
      </div>
    </DialPad>
  )
}
