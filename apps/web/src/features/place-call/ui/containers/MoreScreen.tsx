'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/shared/ui/shadcn/select'
import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'

import { PRESENCE_ORDER, PRESENCE_TONES } from '../../config/dock-tabs.constants'
import { usePhoneSettings } from '../../model/usePhoneSettings'

import type { AudioDeviceKind, AudioDeviceOption } from '../../model/types/call.types'

type DeviceRowProps = {
  readonly label: string
  readonly placeholder: string
  readonly value: string | null
  readonly options: readonly AudioDeviceOption[]
  readonly onChange: (id: string) => void
}

function DeviceRow({ label, placeholder, value, options, onChange }: Readonly<DeviceRowProps>) {
  const selected = options.find((option) => option.id === value)
  return (
    <Select value={value ?? undefined} onValueChange={onChange} disabled={options.length === 0}>
      <SelectTrigger className="w-full rounded-none border-0 border-b border-border/60 bg-transparent px-4 py-3 shadow-none hover:bg-muted/50 focus-visible:ring-0 disabled:cursor-default disabled:opacity-100 data-[size=default]:h-auto dark:bg-transparent">
        <span className="flex min-w-0 flex-col items-start gap-1 text-left">
          <Text variant="fine">{label}</Text>
          <Text variant="strong" className="max-w-full truncate leading-tight text-foreground">
            {selected?.label ?? placeholder}
          </Text>
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function MoreScreen() {
  const { t } = useTranslation()
  const settings = usePhoneSettings(t('dialer.audio.fallbackDevice'))
  const deviceRows: readonly { kind: AudioDeviceKind; options: readonly AudioDeviceOption[] }[] = [
    { kind: 'mic', options: settings.devices.mics },
    { kind: 'speaker', options: settings.devices.outputs },
    { kind: 'ringer', options: settings.devices.outputs },
  ]

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {PRESENCE_ORDER.map((key) => (
        <PillButton
          key={key}
          variant="ghost"
          size="sm"
          aria-pressed={settings.presence === key}
          onClick={() => settings.setPresence(key)}
          className={cn(
            'h-10 w-full shrink-0 justify-start gap-2.5 rounded-none border-b border-border/60 px-4 font-medium',
            settings.presence === key ? 'text-foreground' : 'text-body',
          )}
        >
          <span aria-hidden className={cn('size-2 rounded-full', PRESENCE_TONES[key])} />
          <span className="flex-1 text-left">{t(`dialer.presenceOptions.${key}`)}</span>
          {settings.presence === key ? (
            <CheckIcon className="size-3.5 text-primary-deep dark:text-primary" />
          ) : null}
        </PillButton>
      ))}
      <Text variant="kicker" className="px-4 pt-3.5 pb-1.5">
        {t('dialer.audio.title')}
      </Text>
      {deviceRows.map((row) => (
        <DeviceRow
          key={row.kind}
          label={t(`dialer.audio.${row.kind}`)}
          placeholder={t('dialer.audio.systemDefault')}
          value={settings.audio[row.kind]}
          options={row.options}
          onChange={(id) => settings.setAudioDevice(row.kind, id)}
        />
      ))}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-2.5">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text variant="strong" className="leading-tight">
            {t('dialer.receiveHere')}
          </Text>
          <Text variant="fine" className="leading-snug">
            {t('dialer.receiveHereHint')}
          </Text>
        </span>
        <AnimatedToggle
          checked={settings.receiveHere}
          onChange={settings.toggleReceiveHere}
          label={t('dialer.receiveHere')}
        />
      </div>
      <div className="px-4 pt-3 pb-4">
        <PillButton
          variant="tertiary"
          size="xs"
          onClick={settings.signOut}
          className="w-full border-negative-text text-negative-text hover:bg-negative-surface"
        >
          {t('dialer.signOut')}
        </PillButton>
      </div>
    </div>
  )
}
