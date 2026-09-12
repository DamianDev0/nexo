'use client'

import { useTranslation } from 'react-i18next'

import { buildTimePickerLabels, TimePicker } from '@/shared/ui/molecules/time-picker'

type MeetingTimeFieldProps = {
  readonly label: string
  readonly value: string
  readonly onChange: (value: string) => void
}

export function MeetingTimeField({ label, value, onChange }: Readonly<MeetingTimeFieldProps>) {
  const { t } = useTranslation()

  return <TimePicker value={value} onChange={onChange} labels={buildTimePickerLabels(t, label)} />
}
