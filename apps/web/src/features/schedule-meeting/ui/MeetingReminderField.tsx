'use client'

import { useTranslation } from 'react-i18next'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'

import { REMINDER_CHOICES } from '../config/meeting.constants'

type MeetingReminderFieldProps = {
  readonly value: number
  readonly onChange: (minutes: number) => void
}

export function MeetingReminderField({ value, onChange }: Readonly<MeetingReminderFieldProps>) {
  const { t } = useTranslation()

  return (
    <Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
      <SelectTrigger
        aria-label={t('contacts.composers.meeting.reminder')}
        className="h-8 w-full border-none bg-transparent px-0 shadow-none"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {REMINDER_CHOICES.map((minutes) => (
          <SelectItem key={minutes} value={String(minutes)}>
            {t(`contacts.composers.meeting.reminderChoice.${minutes}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
