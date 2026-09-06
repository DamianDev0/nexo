'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { CaretDownIcon } from '@/shared/ui/icons'
import { DialPad } from '@/shared/ui/organisms/dial-pad'
import { Input } from '@/shared/ui/shadcn/input'

type DialerPanelProps = {
  readonly value: string
  readonly canCall: boolean
  readonly actions: {
    readonly onDigit: (digit: string) => void
    readonly onDelete: () => void
    readonly onCall: () => void
    readonly onInput: (raw: string) => void
  }
}

export function DialerPanel({ value, canCall, actions }: Readonly<DialerPanelProps>) {
  const { t } = useTranslation()
  return (
    <DialPad
      value={value}
      onDigit={actions.onDigit}
      onDelete={actions.onDelete}
      className="w-full flex-1 gap-2.5 px-4 pt-2 pb-3"
    >
      <div className="flex items-center justify-center gap-1.5">
        <Text variant="muted">{t('dialer.callerId')}:</Text>
        <Text variant="strong" className="tabular-nums">
          —
        </Text>
        <CaretDownIcon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="relative w-full">
        <Input
          value={value}
          onChange={(event) => actions.onInput(event.target.value)}
          placeholder={t('dialer.placeholder')}
          aria-label={t('dialer.placeholder')}
          className="h-8 w-full border-none bg-transparent text-center text-base font-medium shadow-none tabular-nums placeholder:text-muted-foreground focus-visible:ring-0 dark:bg-transparent"
        />
        <DialPad.Backspace
          label={t('dialer.backspace')}
          className="absolute top-1/2 right-0 size-8 -translate-y-1/2"
        />
      </div>
      <DialPad.Keypad />
      <DialPad.Call label={t('dialer.call')} onCall={actions.onCall} disabled={!canCall} />
    </DialPad>
  )
}
